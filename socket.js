const socketIO = require('socket.io');

let io;
// Déclarer une variable pour stocker les utilisateurs connectés

function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:5173",
        }
    });

  let users = []

    io.on('connection', (socket) => {
        console.log('A client connected');
    
        socket.on('addUser', userId => {
            console.log('User added:', userId);
            const isuserExist = users.find(user=>user.userId === userId)
            if(!isuserExist)
            {
            users.push({ userId: userId, socketId: socket.id });
            io.emit('getUsers', users);
            }
        });
    
        

        socket.on('sendMessage',({senderId,receiverId,msg,conversationId})=>{
         const receiver = users.find(user=>user.userId === receiverId);
         const sender =users.find(user=>user.userId === senderId)
         if(receiver)
         {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage',{
                senderId,
                receiverId,
                msg,
                conversationId
               
            });
         }


        });

        socket.on('disconnect', () => {
            console.log('A client disconnected');
            users = users.filter(user => user.socketId !== socket.id);
            io.emit('getUsers', users);
        });
     
        // Autres écouteurs d'événements peuvent être ajoutés ici
    });
    

    return io;
}

function getSocketInstance() {
    if (!io) {
        throw new Error('Socket has not been initialized. Call initializeSocket(server) first.');
    }
    return io;
}

module.exports = {
    initializeSocket,
    getSocketInstance
};
