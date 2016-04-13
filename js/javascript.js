var Router = {
    routes: [],
    mode: null,
    root: '/',
    config: function(options) { 
        this.mode = options && options.mode && options.mode == 'history' 
                    && !!(history.pushState) ? 'history' : 'hash'; // History API mode or hash mode
        this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
        return this;
    },
    getFragment: function() { // tells us where we are at the moment
        var fragment = '';
        if(this.mode === 'history') {
            fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            var match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return this.clearSlashes(fragment);
    },
    clearSlashes: function(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },
    add: function(re, handler) { // add route
        if(typeof re == 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re: re, handler: handler});
        return this;
    },
    remove: function(param) {
        for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                this.routes.splice(i, 1); 
                return this;
            }
        }
        return this;
    },
    flush: function() {  //reinitialize the class
        this.routes = [];
        this.mode = null;
        this.root = '/';
        return this;
    },
    check: function(f) { //get the current address
        var fragment = f || this.getFragment();
        for(var i=0; i<this.routes.length; i++) {
            var match = fragment.match(this.routes[i].re);
            if(match) {
                match.shift();
                this.routes[i].handler.apply({}, match);
                return this;
            }           
        }
        return this;
    },
    listen: function() { //monitoring for changes
        var self = this;
        var current = self.getFragment();
        var fn = function() {
            if(current !== self.getFragment()) {
                current = self.getFragment();
                self.check(current);
            }
        }
        clearInterval(this.interval);
        this.interval = setInterval(fn, 50);
        return this;
    },
    navigate: function(path) { //changing the url
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    }
}
Router
.add(/about/, function() {
    console.log('about');
})

.add(/products\/(.*)\/edit\/(.*)/, function() {
    console.log('products', arguments);
})
.add(function() {
    console.log('default');
})

.check('/products/14/edit/85').listen();

document.getElementById("api").addEventListener('click',function(){ 
    Router.config({ mode: 'history'});
    Router.navigate();
    show()
});
document.getElementById("hash").addEventListener('click',function(){ 
    Router.config({ mode: 'hash'});
    Router.navigate();
    show()
});
document.getElementById("def").addEventListener('click',function(e){
    e.preventDefault();
    Router.navigate();
});
document.getElementById("about").addEventListener('click',function(e){
    e.preventDefault();
    Router.navigate('/about');
});
document.getElementById("products").addEventListener('click',function(e){
    e.preventDefault();
    Router.navigate('/products/12');
});
document.getElementById("products14").addEventListener('click',function(e){
    e.preventDefault();
    Router.navigate('/products/14/edit/85');
});
function show(){
    document.querySelector(".tests").classList.remove('disp');
}

        