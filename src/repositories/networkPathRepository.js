const { NetworkPath } = require("../models");


const networkPathRepository = {


    findAll: async()=>{

        return await NetworkPath.findAll();

    },


    findById: async(id)=>{

        return await NetworkPath.findByPk(id);

    },


    create: async(data)=>{

        return await NetworkPath.create(data);

    },

update: async(id, data)=>{

    const path = await NetworkPath.findByPk(id);


    if(!path){
        return null;
    }


    await path.update(data);


    return await NetworkPath.findByPk(id);

},


    delete: async(id)=>{

        const path =
        await NetworkPath.findByPk(id);


        if(!path){
            return null;
        }


        await path.destroy();


        return path;

    }


};


module.exports = networkPathRepository;