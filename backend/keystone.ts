import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import { User } from './schemas/User';
import { Product } from './schemas/Products';
import { ProductImage } from './schemas/ProductImage';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session'
import { insertSeedData } from './seed-data';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost/ecommerce';

const sessionConfig = {
    maxAge: 60 * 60 * 24 * 360,
    secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'email', 'password']
        //add roles
    }

})

export default withAuth(config({
    server: {
        cors:{
            origin: [process.env.FRONTEND_URL],
            credentials: true,
        }  
    },
    db: {
        adapter: 'mongoose',
        url: databaseURL,
        async onConnect(keystone){
            if(process.argv.includes('--seed-data')){

                await insertSeedData(keystone)
            }
        }
    },
    lists: createSchema({
        User,
        Product,
        ProductImage
    }),
    ui: {
        //change for roles
        isAccessAllowed: ({ session }) => {
            return !!session?.data;
        }
    },
    session: withItemData(statelessSessions(sessionConfig), {
        User: `id`
    })
}

))