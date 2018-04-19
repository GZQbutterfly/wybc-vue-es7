
/**
 * 源路径跳转 进行版本号控制 获取新资源
 */
let v = 'v-4.6.1' + process.env.PACK_V;

export default () => {
    let path = location.pathname;
    console.log('pack vesion: ', v);
    if (/^\/$/.test(path)) {
        if (window.localStorage.__v != v) {
            window.localStorage.__v = v;
            location.replace(location.origin + '/lead?v=' + v);
        }
    }
}