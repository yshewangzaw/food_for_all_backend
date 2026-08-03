const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const NetworkPath = sequelize.define(
"NetworkPath",
{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},


ancestorId:{
type:DataTypes.INTEGER,
allowNull:false
},


descendantId:{
type:DataTypes.INTEGER,
allowNull:false
},


level:{
type:DataTypes.INTEGER,
allowNull:false
}


},
{
tableName:"network_paths",
timestamps:true
}

);


module.exports = NetworkPath;