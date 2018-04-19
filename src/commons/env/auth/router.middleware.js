/**
 * 路由 中间件
 */
import mallesShop from './logic/malles.shop';

export default async function(to, from) {


    await mallesShop(this._store, to, from);

    return true;
}