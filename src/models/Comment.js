const Model = require('./Model');
const User = require('./User');
const Post = require('./Post')

class Comment extends Model {
        /**
	 * Creates a new Pokemon.
	 * @param {string} content
	 * @param {number} post_id
     * @param {number} id
     * @param {number} user_id
     * @param {number} reply_id
	 */
	constructor(id,user_id,post_id,content) {
        super(id)
        this.user_id = user_id;
        this.post_id = post_id;
        this.content = content;
        this.user = null;
        this.post = null;
        this.repliedComment = null;
        this.reply_id = null;
        

	}

    static async create(user_id,post_id,content){
        const connection = await Model.connect();   
        const sql = `INSERT INTO comment( user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW());`

        try{
            
            let results;        

            [results] = await connection.execute(sql,[user_id,post_id,content])
            var newCom = new Comment(results.insertId,user_id,post_id,content)
            await newCom.setUser();
            await newCom.setPost();
            return newCom;

        }
        catch(error){
            console.log(error)
            return null;
        }
        finally{
            await connection.end();
        }
    }

    static async create(user_id,post_id,content,reply_id = null){
        const connection = await Model.connect(); 
        const sql = `INSERT INTO comment( user_id, post_id, content, reply_id, created_at) VALUES (?, ?, ?,? , NOW());`

        try{
            
            let results;
            if(content.length == 0){
                return null;
            }
                
            [results] = await connection.execute(sql,[user_id,post_id,content,reply_id])
    
            var newCom = new Comment(results.insertId,user_id,post_id,content)

            if(reply_id !== null){
                newCom.setReplyID(reply_id)
                await newCom.setRepliedTo()
            }

            await newCom.setUser();
            await newCom.setPost();
            return newCom;

        }
        catch(error){
            console.log(error)
            return null;
        }
        finally{
            await connection.end();
        }
    }

    async setUser(){        
        this.user = await User.findById(this.user_id);
    }

    getUser(){
        return this.user;
    }

    async setPost(){        
        this.post = await Post.findById(this.post_id);
    }

    getPost(){
        return this.post;
    }

    getContent(){
        return this.content;
    }

    getRepliedTo(){
        return null;
    }

    setReplyID(reply_Id){
        this.reply_id = reply_Id;
    }

    async setRepliedTo(){
        this.repliedComment = await Comment.findById(this.reply_id)
    }

    getRepliedTo(){
        return this.repliedComment;
    }

    static async findById(id){
        const connection = await Model.connect();
        try{
            const sql = `SELECT * FROM comment WHERE id = ?`;
		    let results;
		
		    [results] = await connection.query(sql,[id]);

            if(results[0] == null){
            return await null
            }

            var retrieved = new Comment(results[0].id,results[0].user_id,results[0].post,results[0].content,results[0].reply_id)           
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
        const sql = `update comment set deleted_at = NOW() where id = ? ;`;
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

    async save(){        
        const connection = await Model.connect();
        const sql = `update comment set content = ?, edited_at = NOW() where id = ? ;`;
        let results;

        if( this.content.length == 0 ){
            return false;
        }

        try{

		    [results] = await connection.execute(sql,[this.content,this.id]);
            
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

    setContent(content){
        this.content = content;
    }

    getContent(){
        return this.content;
    }

}

module.exports = Comment;
