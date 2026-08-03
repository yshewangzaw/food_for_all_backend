const userRepository = require("../repositories/userRepository");


const userService = {


    getAllUsers: async()=>{

        return await userRepository.findAll();

    },


    getUserById: async(id)=>{

        const user =
        await userRepository.findById(id);


        if(!user){
            throw new Error("User not found");
        }


        return user;

    },


    createUser: async(data)=>{

        return await userRepository.create(data);

    },


    updateUser: async(id,data)=>{

        const user =
        await userRepository.update(id,data);


        if(!user){
            throw new Error("User not found");
        }


        return user;

    },


    deleteUser: async(id)=>{

        const user =
        await userRepository.delete(id);


        if(!user){
            throw new Error("User not found");
        }


        return user;

    }


};


module.exports = userService;