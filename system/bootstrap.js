import http from 'http'
import dbConnection from './dbConnection.js'


export default class BootstrapApp{
    constructor(app){
        this.port = process.env["server_port"]
        this.server = http.createServer(app)
        this.server.listen(this.port)
        this.createDBConnection()
    }

    createDBConnection(){
        try {
            
            new dbConnection()

        } catch (error) {
            console.log(`Error in DB connection ::: ${error.message}`)
        }
    }
}