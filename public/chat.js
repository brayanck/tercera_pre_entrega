const socket = io();
const messageForm = document.getElementById("menssage-form")
const chat = document.getElementById("chat")
const message = document.getElementById("menssage")


messageForm.addEventListener("submit", async(e) => {
    e.preventDefault()
    console.log("hola")
    try {
        console.log("hola")
        const response = await fetch(`/auth/user`);
        const data = await response.json();
        let mensaje= {
            email:data.email,
            message: message.value
        }
        socket.emit("send-message",mensaje)
        message.value=""
        // Aquí puedes realizar acciones adicionales después de agregar el producto al carrito
    } catch (error) {
        console.log('Error al agregar el producto al carrito:', error);
    }


    })
    socket.on("new-message", (data) => {
        chat.innerHTML+=`<b>${data.email}</b>: <p>${data.message}</p>`
    }) 
    
    socket.on("load-old-messages",(data)=>{
        data.map((el)=>{
            render(el)
        })
    })
    
    const render = (data)=>{
        chat.innerHTML+=`<p>${data.email}: ${data.message}</p>`
    }