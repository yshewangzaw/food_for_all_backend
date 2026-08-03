const userService = require("../services/userService");


const userController = {


getUsers: async(req,res)=>{

    try{

        const users =
        await userService.getAllUsers();


        res.json({
            success:true,
            data:users
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

},



getUser: async(req,res)=>{

    try{

        const user =
        await userService.getUserById(
            req.params.id
        );


        res.json({
            success:true,
            data:user
        });


    }catch(error){

        res.status(404).json({
            success:false,
            message:error.message
        });

    }

},



createUser: async(req,res)=>{

    try{

        const user =
        await userService.createUser(
            req.body
        );


        res.status(201).json({
            success:true,
            data:user
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

},



updateUser: async(req,res)=>{

    try{

        const user =
        await userService.updateUser(
            req.params.id,
            req.body
        );


        res.json({
            success:true,
            data:user
        });


    }catch(error){

        res.status(404).json({
            success:false,
            message:error.message
        });

    }

},



deleteUser: async(req,res)=>{

    try{

        await userService.deleteUser(
            req.params.id
        );


        res.json({
            success:true,
            message:"User deleted"
        });


    }catch(error){

        res.status(404).json({
            success:false,
            message:error.message
        });

    }

}


};


module.exports = userController;