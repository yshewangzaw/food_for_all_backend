const networkPathService =
require("../services/networkPathService");


const networkPathController = {



getAll: async(req,res)=>{

try{

const paths =
await networkPathService.getAll();


res.json({
success:true,
data:paths
});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

},



getOne: async(req,res)=>{

try{

const path =
await networkPathService.getById(
req.params.id
);


res.json({
success:true,
data:path
});


}catch(error){

res.status(404).json({
success:false,
message:error.message
});

}

},



create: async(req,res)=>{

try{

const path =
await networkPathService.create(
req.body
);


res.status(201).json({
success:true,
data:path
});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

},



update: async(req,res)=>{

    try{

        const path =
        await networkPathService.update(
            req.params.id,
            req.body
        );


        res.json({
            success:true,
            data:path
        });


    }catch(error){

        res.status(404).json({
            success:false,
            message:error.message
        });

    }

},

delete: async(req,res)=>{

try{

await networkPathService.delete(
req.params.id
);


res.json({
success:true,
message:"Network path deleted"
});


}catch(error){

res.status(404).json({
success:false,
message:error.message
});

}

}


};


module.exports = networkPathController;