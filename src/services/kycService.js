const kycRepository =
require("../repositories/kycRepository");


const kycService = {


getAll:async()=>{

return await kycRepository.findAll();

},


getById:async(id)=>{

const kyc =
await kycRepository.findById(id);


if(!kyc){
throw new Error("KYC not found");
}


return kyc;

},


create:async(data)=>{

return await kycRepository.create(data);

},


update:async(id,data)=>{

const kyc =
await kycRepository.update(id,data);


if(!kyc){
throw new Error("KYC not found");
}


return kyc;

},


delete:async(id)=>{

const kyc =
await kycRepository.delete(id);


if(!kyc){
throw new Error("KYC not found");
}


return kyc;

}


};


module.exports = kycService;