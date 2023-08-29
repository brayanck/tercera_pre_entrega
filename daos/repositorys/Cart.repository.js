class CartRepository{
    constructor(dao){
        this.dao = dao;
    }
    createCart = async () => {
        try {
            return await this.dao.saveCart();
        } catch (err) {
            console.log(err);
            return null;
        }
    };
    getCartById = async (id) => {
        try {
            return await this.dao.getCart(id);
        } catch (err) {
            console.log(err);
            return null;
        }
    };
    eliminarProductDelCart = async (idCart, idProducto) => {
        try {
            return await this.dao.eliminarProduct(idCart,idProducto)
        } catch (err) {
            console.log(err);
            return null;
        }
    };
    vaciarCarro = async (idCarrito) => {
        try {
            return await this.dao.vaciar(idCarrito)
        } catch (err) {
            console.log(err);
            return null;
        }
    };
    actualizarCantidadCart = async (idCarrito, idProducto, count) => {
        try {
            return await this.dao.actualizarCantidad(idCarrito, idProducto, count)
        } catch (err) {
            console.log(err);
            return null;
        }
        
    };
    pushProductToCart = async (idCarrito, idProducto, count) => {
        try {
            return await this.dao.pushProduct(idCarrito, idProducto, count);
        } catch (err) {
            console.log(err);
            return null;
        }
    };
}
module.exports=CartRepository