import {getDomTop} from 'common.env';

document.body.addEventListener('touchstart', (e) => {
    let _target = e.target;
    let _touches = e.targetTouches || e.touches || e.changedTouches;
    let _touch = _touches[0];
    let _pageX = _touch.pageX;
    let _pageY = _touch.pageY;
   // console.log(_touch, _pageX, _pageY);

});
document.body.addEventListener('touchmove', (e) => {
    let _target = e.target;
    let _touches = e.targetTouches || e.touches || e.changedTouches;
    let _touch = _touches[0];
    let _pageX = _touch.pageX;
    let _pageY = _touch.pageY;

    // let _top = getDomTop(_target);

    // if(_top > _pageY  && _top <  _pageY + 60){
    //     e.preventDefault();
    // }
    // if(!_top){
    //     e.preventDefault();
    // }
    e.preventDefault();
});

document.body.addEventListener('touchend', () => {

});
