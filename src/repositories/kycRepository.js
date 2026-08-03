const { KycDocument } = require("../models");


const kycRepository = {


findAll:async()=>{

return await KycDocument.findAll();

},


findById:async(id)=>{

return await KycDocument.findByPk(id);

},


create:async(data)=>{

return await KycDocument.create(data);

},


update:async(id,data)=>{

const kyc =
await KycDocument.findByPk(id);


if(!kyc){
return null;
}


await kyc.update(data);


return await KycDocument.findByPk(id);

},


delete:async(id)=>{

const kyc =
await KycDocument.findByPk(id);


if(!kyc){
return null;
}


await kyc.destroy();


return kyc;

}


};


module.exports = kycRepository;