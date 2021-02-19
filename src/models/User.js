const { Console } = require('console');
const Model = require('./Model');

class User extends Model {
    /**
	 * Creates a new Pokemon.
	 * @param {string} username
	 * @param {string} email
	 * @param {string} password
     * @param {number} id
	 */
	constructor(id,username, email, password) {
        super(id)
		this.username = username;
		this.email = email;
        this.password = password
        this.avatar = null;
	}

    static async create(username, email, password) {
		const connection = await Model.connect();
        if(username == "" || email == "" || password == "" ){
            await connection.end();
            return null;
        }

        let results;
        const sql = `INSERT INTO user(username, email, password, created_at) VALUES (?, ?, ?, NOW());`

        try
        {
            [results] = await connection.execute(sql, [username, email, password]);        
            var newuser = new User(results.insertId,username,email,password)
            await connection.end();
            return newuser;

        }
        catch(error)
        {
            console.log(error);
            await connection.end();
            return null;
        }

	}

    static async findById(id){
        const connection = await Model.connect();
        let results;
        try{
            const sql = `SELECT * FROM user WHERE id = ?`;
		    
		
		    [results] = await connection.query(sql,[id]);
            if(results[0] == null){
                await connection.end();
                return await null
            }

            var retrieved = new User(results[0].id,results[0].username,results[0].email,results[0].password)           
            retrieved.setCreatedAt( new Date(results[0].create_at))
          
            if(results[0].edited_at != null){
               retrieved.setEditedAt( new Date (results[0].edited_at)) 
            }

            if(results[0].deleted_at != null){
                retrieved.setDeletedAt( new Date (results[0].deleted_at)) 
            }

            retrieved.setAvatar(results[0].avatar)
            await connection.end();
            return await retrieved
        }
        catch(error){
            console.log(error)
            await connection.end();
            return await null
        }

    }
    
    static async findByEmail(email){
        const connection = await Model.connect();
        try{
            const sql = `SELECT * FROM user WHERE email = ?`;
		    let results;
		
		    [results] = await connection.query(sql,[email]);
            if(results[0] == null){
                await connection.end();
                return await null
            }

            var retrieved = new User(results[0].id,results[0].username,results[0].email,results[0].password)           
            retrieved.setCreatedAt( new Date(results[0].create_at))
           
            if(results[0].Edited_at != null){
                retrieved.setEditedAt( new Date (results[0].edited_at)) 
            }

            if(results[0].deleted_at != null){
                retrieved.setDeletedAt( new Date (results[0].deleted_at)) 
            }

            retrieved.setAvatar(results[0].avatar)
            await connection.end();
            return 	retrieved
        }
        catch(error){
            console.log(error)
            await connection.end();
            return await null;
        }    
   
    }

    setUsername(newUsername){         
        this.username = newUsername;
        
    }

    setAvatar(newAvatar){
      this.avatar = newAvatar;   
    }


    getAvatar(){
        return this.avatar;
    }

    setEmail(newEmail){

        this.email = newEmail
        

    }

    getUsername(){
        return this.username;
    }

    getEmail(){
        return this.email;
    }

    async save(){        
        const connection = await Model.connect();
        const sql = `update user set username = ?, email = ?, avatar = ?, edited_at = NOW() where id = ? ;`;
        let results;

        if( this.username.length == 0 || this.email.length == 0){
            await connection.end();
            return false;
        }

        try{

		    [results] = await connection.execute(sql,[this.username,this.email, this.avatar,this.id]);
            
            this.setEditedAt(Date.now());
            await connection.end();
            return true;
        }
        catch(error){
            console.log(error)
            await connection.end();
            return false;
        }

    }

    async delete(){
        const connection = await Model.connect();
        const sql = `update user set deleted_at = NOW() where id = ? ;`;
        let results;

        try{

		    [results] = await connection.execute(sql,[this.id]);
            
            this.setDeletedAt(Date.now());//fix
            await connection.end();
            return true;
        }
        catch(error){
            console.log(error)
            await connection.end();
            return false;
        }

    }
    
}

module.exports = User;
