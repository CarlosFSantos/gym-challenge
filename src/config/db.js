const {Pool} = require("pg")
//const { password, port, database, user } = require("pg/lib/defaults")

module.exports = new Pool({
    user: "postgres",
    password:"1234",
    host:"localhost",
    port:5432,
    database:"gym"
})