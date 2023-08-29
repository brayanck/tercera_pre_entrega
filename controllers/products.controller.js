const {productServices} = require('../daos/repositorys/index')

const buscarProductController = async (req, res) => {
  try {
    let producto = req.params.pid;
    let produc = await productServices.getProductById(producto)
    console.log(produc);
    if (produc) {
      res.render("detalle", produc);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const guardarProductController=async (req, res) => {
  console.log(req.body)
  const savedProduct = await productServices.createProduct(req.body);
  res.redirect("/api/admin")
}
const eliminarProductoController= async (req, res) => {
  let id= req.params.pid
  const deleteavedProduct =await productServices.deleteProduct(id)
  res.json(deleteavedProduct)
}
const actualizarProductController=async(req,res)=>{
  let id= req.params.pid
  let data= req.body
  const savedProduct =await productServices.restaProduct(id,data)
  res.redirect("/api/admin")
}

module.exports = {
  buscarProductController,
  guardarProductController,
  eliminarProductoController,
  actualizarProductController
};
