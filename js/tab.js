/*
 * @Author: 宋彦斌 
 * @Date: 2021-04-19 14:30:25 
 * @Last Modified by: 宋彦斌
 * @Last Modified time: 2021-04-19 14:30:25 
 */
function tab(o, s, cb, ev) { //tab切换类
    var eid = function (o) {
        return document.getElementById(o)
    };
    var css = o.split((s || '_'));
    if (css.length != 4) return;
    this.event = ev || 'onclick';
    o = eid(o);
    if (o) {
        this.ITEM = [];
        o.id = css[0];
        var item = o.getElementsByTagName(css[1]);
        var j = 1;
        for (var i = 0; i < item.length; i++) {
            if (item[i].className.indexOf(css[2]) >= 0 || item[i].className.indexOf(css[3]) >= 0 || item[i].className.indexOf(css[4]) >= 0) {
                if (item[i].className == css[2]) o['cur'] = item[i];
                item[i].callBack = cb || function () {};
                item[i]['css'] = css;
                item[i]['link'] = o;
                this.ITEM[j] = item[i];
                item[i]['Index'] = j++;
                item[i][this.event] = this.ACTIVE;
            }
        }
        return o;
    }
}
tab.prototype = {
    ACTIVE: function () {
        var eid = function (o) {
            return document.getElementById(o)
        };
        this['link']['cur'].className = this['css'][3];
        this.className = this['css'][2];
        try {
            eid(this['link']['id'] + '_' + this['link']['cur']['Index']).style.display = 'none';
            eid(this['link']['id'] + '_' + this['Index']).style.display = 'block';
        } catch (e) {}
        this.callBack.call(this);
        this['link']['cur'] = this;
    }
}