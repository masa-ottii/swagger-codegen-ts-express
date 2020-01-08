import express from 'express';
import * as handler from '../handlers';

const router = express.Router();
//------ /users/{user_id} ----------
router.route('/simple-v1/users/:user_id')
//------ get user -----
.get(handler.get_user)

//------ /users ----------
router.route('/simple-v1/users')
//------ ユーザー変更 -----
.put(handler.put_users)
//------ ユーザー登録 -----
.post(handler.post_users)


export default router;
