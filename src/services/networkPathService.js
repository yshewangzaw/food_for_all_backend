const networkPathRepository =
require("../repositories/networkPathRepository");



const networkPathService = {


getAll: async()=>{

    return await networkPathRepository.findAll();

},



getById: async(id)=>{

    const path =
    await networkPathRepository.findById(id);


    if(!path){
        throw new Error("Network path not found");
    }


    return path;

},



create: async(data)=>{

    return await networkPathRepository.create(data);

},



update: async(id,data)=>{

    const path =
    await networkPathRepository.update(id,data);


    if(!path){
        throw new Error("Network path not found");
    }


    return path;

},



delete: async(id)=>{

    const path =
    await networkPathRepository.delete(id);


    if(!path){
        throw new Error("Network path not found");
    }


    return path;

}


};


module.exports = networkPathService;