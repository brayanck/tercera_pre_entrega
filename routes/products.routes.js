const router = require("express").Router();
const {eliminarProductoController,actualizarProductController}=require('../controllers/products.controller')
const {buscarProductController,guardarProductController}=require('../controllers/products.controller')
const {isAuthenticatedAdmin,isAuthenticated}= require('../utils/auth')
router.use(isAuthenticated)

router.get('/:pid', buscarProductController);
router.use(isAuthenticatedAdmin)
router.post('/',guardarProductController)
router.delete('/:pid', eliminarProductoController);
router.put('/:pid', actualizarProductController);


module.exports = router;