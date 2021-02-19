const Category = require('./Category');
const Model = require('./Model');
const User = require('./User');


class Post extends Model {
    /**
	* Creates a new Pokemon.    
    * @param {number} id	
    * @param {number} user_id
    * @param {number} category_id
    * @param {string} title
    * @param {enum} type
    * @param {text} content
	*/

	constructor(id, user_id, category_id, title, type, content) {
        super(id)
        this.user_id = user_id;
        this.category_id = category_id;
        this.title = title;
        this.type = type
        this.content = content;
        this.user = null;
        this.category = null;
	}

    static async create(user_id, category_id, title, type, content){
        const connection = await Model.connect();   
        const sql = `INSERT INTO post( user_id, category_id, title, type, content, created_at) VALUES (?, ?, ?, ?, ?, NOW());`

        try{
            
            let results;        
            if(title.length == 0 || content.length == 0){
                return null;
            }

            [results] = await connection.execute(sql,[user_id, category_id, title, type, content])
            var newPost = new Post(results.insertId,user_id, category_id, title, type, content)
            await newPost.setUser();
            await newPost.setCategory()
            return newPost;

        }
        catch(error){
            console.log(error)
            return null;
        }
        finally{
            await connection.end();
        }
    }

    static async findById(id){
        const connection = await Model.connect();
        try{
            const sql = `SELECT * FROM post WHERE id = ?`;
		    let results;
		
		    [results] = await connection.query(sql,[id]);
            if(results[0] == null){
            return await null
            }

            var retrieved = new Post(results[0].id,results[0].user_id,results[0].category_id,results[0].title,results[0].type,results[0].content)           
            retrieved.setCreatedAt( new Date(results[0].create_at))
          
            if(results[0].edited_at != null){
               retrieved.setEditedAt( new Date(results[0].edited_at)) 
            }

            if(results[0].deleted_at != null){
                retrieved.setDeletedAt( new Date(results[0].deleted_at)) 
            }


        }
        catch(error){
            console.log(error)
            return await null
        }
        finally{
            await connection.end();
        }

        return await retrieved
    }

    async delete(){
        const connection = await Model.connect();
        const sql = `update post set deleted_at = NOW() where id = ? ;`;
        let results;

        try{

		    [results] = await connection.execute(sql,[this.id]);
            
            this.setDeletedAt(Date.now());//fix

            return true;
        }
        catch(error){
            console.log(error)
            return false;
        }
        finally{
            await connection.end();
        }
    
    }

    getTitle(){
        return this.title;
    }

    getContent(){
        return this.content;
    }

    async setUser(){        
        this.user = await User.findById(this.user_id);
    }

    async setCategory( ){        
        this.category = await Category.findById(this.category_id);
    }

    getUser(){
        return this.user;
    }

    getCategory(){
        return this.category
    }

    setContent(content){
        this.content = content
    }

    async save(){        
        const connection = await Model.connect();
        const sql = `update post set title = ?, content = ?, edited_at = NOW() where id = ? ;`;
        let results;

        if( this.title.length == 0 || this.content.length == 0 || this.type == 'URL'){
            return false;
        }

        try{

		    [results] = await connection.execute(sql,[this.title,this.content,this.id]);
            
            this.setEditedAt(Date.now());

            return true;
        }
        catch(error){
            console.log(error)
            return false;
        }
        finally{
            await connection.end();
        }
    }

}

module.exports = Post;
