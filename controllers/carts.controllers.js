const sendMail = require("./email.controler");
const {
  cartServices,
  userServices,
  productServices,
  ticketServices,
} = require("../daos/repositorys/index");
const buscarCarroIdController = async (req, res) => {
  try {
    const usuarioEmail = req.user.email;
    const usuario = await userServices.getUserByEmail(usuarioEmail);
    console.log(usuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    console.log(usuario.cartId);
    res.json(usuario.cartId);
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
const obtenerCarroController = async (req, res) => {
  try {
    let carrito = req.params.cid;
    let carro = await cartServices.getCartById(carrito);
    res.render("cart", { carro });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const eliminarProductoController = async (req, res) => {
  try {
    let carrito = req.params.cid;
    let producto = req.params.pid;
    const cart = await cartServices.getCartById(carrito);
    if (cart) {
      const updatedCart = await cartServices.eliminarProductDelCart(
        carrito,
        producto
      );
      res.json(updatedCart);
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
const eliminarCarroController = async (req, res) => {
  try {
    let carrito = req.params.cid;
    const result = await cartServices.vaciarCarro(carrito);
    res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
const actualizarCarroController = async (req, res) => {
  try {
    const count = req.body.count;
    const carrito = req.params.cid;
    const producto = req.params.pid;
    const carro = await cartServices.getCartById(carrito);
    const product = await productServices.getProductById(producto);
    if (carro && product) {
      const cartItem = carro.cart.find((item) => {
        if (item.product._id.toString() === producto.toString()) {
          return true;
        }
      });
      if (cartItem) {
        const updatedCart = await cartServices.actualizarCantidadCart(
          carrito,
          product,
          count
        );
        return res.json(updatedCart);
      } else {
        const updatedCart = await cartServices.pushProductToCart(
          carrito,
          product._id,
          count
        );
        return res.json(updatedCart);
      }
    } else {
      res.json("El producto o el carrito no existen");
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};
const comprar = async (req, res) => {
  const carritoId = req.params.cid;
  try {
    const carro = await cartServices.getCartById(carritoId);
    if (!carro) {
      return res.json("El carrito no existe");
    }
    let descarte = [];
    let total = 0;
    for (const product of carro.cart) {
      const producto = await productServices.getProductById(
        product.product._id
      );
      if (product.count <= producto.stock) {
        producto.stock -= product.count;
        const updatedProduct = await productServices.restaProduct(
          product.product._id,
          producto
        ); // Llamada corregida
        if (!updatedProduct) {
          return res.status(500).json("Error al actualizar el producto");
        }
        await cartServices.eliminarProductDelCart(carritoId, product.id);
        total += product.product.price;
      } else {
        descarte.push(product);
      }
    }
    let tiket = {
      amount: total,
      purcharser: req.user.email,
    };
    let compradoTicket = await ticketServices.saveTiket(tiket);
    let email = {
      to: req.user.email,
      subject: "compra",
      text: "gracias por la compra",
      html: `<div class="container">
            <h1>ticket de compra</h1>
              <div class="row">
                      <h2 class="product-name"> codigo de compra: ${compradoTicket.code}</h2>
                      <div class="product-meta">
                          <p class="product-price">Precio: ${compradoTicket.amount}</p>
                          <p class="product-category">email: ${compradoTicket.purcharser}</p>
                      </div>
                  </div>
              </div>
          </div>`,
    };
    sendMail(email);

    res.render("ticket", compradoTicket);
    // Resto de tu código
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json("Error en el servidor");
  }
};

module.exports = {
  buscarCarroIdController,
  obtenerCarroController,
  eliminarProductoController,
  eliminarCarroController,
  actualizarCarroController,
  comprar,
};
