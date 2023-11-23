import 'dotenv/config';

export const dev ={
    app:{port: Number (process.env.PORT) ||3000},
    db:{
        url:
        process.env.ATLAS_URL || 'mongodb+srv://leen77:leen77@cluster0.u62udj1.mongodb.net/SDA-Backend-Project'
    }

}