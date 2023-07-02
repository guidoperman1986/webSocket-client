import { Manager, Socket } from "socket.io-client"

let socket: Socket;

export const connectToServer = (token: string) => {
    const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
        extraHeaders: {
            authentication: token
        }
    });

    socket?.removeAllListeners
    socket = manager.socket('/');

    addListener();
}

const addListener = () => {
    const serverStatusLabel = document.querySelector('#server-status')!;
    const clientsUl = document.querySelector('#clients-ul')!;
    
    const messageForm = document.querySelector<HTMLFormElement>('#message-form');
    const messageInput = document.querySelector<HTMLInputElement>('#message-input')!;
    
    const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;
    socket.on('connect', ()=> {
        serverStatusLabel.innerHTML = 'Connected'
    })

    socket.on('clients-updated', (clients: [])=> {
        let clientsHtml = '';
        clients.forEach(client=>{
            clientsHtml += `
                <li>${client}</li>
            `
        })

        clientsUl.innerHTML = clientsHtml;
    })

    messageForm?.addEventListener('submit', (event)=> {
        event.preventDefault();

        if (messageInput!.value.trim().length <= 0) return;

        socket.emit('message-from-client', {id: 'gato', message: messageInput!.value})

        messageInput.value = '';
    })

    socket.on('message-from-server', (payload: { fullName: string, message: string }) => {
        const newMessage = `
            <li>
                <strong>${payload.fullName}</strong>
                <strong>${payload.message}</strong>
            </li>
        `

        const li = document.createElement('li');
        li.innerHTML = newMessage;
        messagesUl.append(li)
    })
    
    socket.on('disconnect', ()=> {
        serverStatusLabel.innerHTML = 'Disconnected'
    })
}