const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const KycDocument = sequelize.define(
"KycDocument",
{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},


userId:{
type:DataTypes.INTEGER,
allowNull:false
},


documentType:{
type:DataTypes.ENUM(
"NATIONAL_ID",
"PASSPORT",
"DRIVING_LICENCE"
),
allowNull:false
},


documentNumber:{
type:DataTypes.STRING,
allowNull:false
},


frontImageUrl:{
type:DataTypes.STRING,
allowNull:false
},


backImageUrl:{
type:DataTypes.STRING,
allowNull:true
},


selfieImageUrl:{
type:DataTypes.STRING,
allowNull:true
},


status:{
type:DataTypes.ENUM(
"PENDING",
"APPROVED",
"REJECTED"
),
defaultValue:"PENDING"
},


rejectionReason:{
type:DataTypes.TEXT,
allowNull:true
}

},
{
tableName:"kyc_documents",
timestamps:true
}
);


module.exports = KycDocument;