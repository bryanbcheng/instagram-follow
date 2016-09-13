(function() {
    /**
     * [Namespacing]
     */
    var Insta = Insta || {};
    
    Insta.App = {

        /**
         * [Application initialization method / call for the methods being initializated in order]
         */
        init: function() {
            //this.mostRecent();
            this.getData();
            //this.aboutInfo();
            //this.mobileNav();
        },

        /**
         * [Interaction to open mobile navigation]
         */
        mobileNav: function() {
            var btMobNav = $('#js-mobNav'),
                nav = $('.nav');

            btMobNav.on('click', function(e) {
                e.preventDefault();
                if( !nav.hasClass('active') ) {
                    nav.addClass('active');
                } else {
                    nav.removeClass('active');
                }
            });

        },

        /**
         * [get data ajax and send to render method]
         */
        getData: function() {
            var self = this;
	    $.ajax({
                url: 'medias',
                type: 'GET',
                dataType: 'html'
            }).done(function (data) {
                self.renderTemplate(data);
	    });
        },

        /**
         * [Render the images on the page and check for layout resize]
         */
        renderTemplate: function(data) {
	    $("#feed").html(data);
	    console.log("rendering image");
	    console.log(data);
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */
        mostRecent: function() {
            socket.on('firstShow', function (data) {
                var clean = $('imgContent').find('a').remove();
                var
                    query = data,
                    source = $('#firstShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate(query),
                    imgWrap = $('#imgContent');

                imgWrap.html(result);
            });
        },

        /**
         * [about view interaction show/hide]
         */
        aboutInfo: function() {
            var about = $('.aboutWrap'),
                btClose = $('#js-closeAbout').find('a'),
                bt = $('#js-btAbout'),
                user = localStorage.getItem('user');

            if( user ) {
                about.removeClass('active');
            } else {
                localStorage.setItem('user', 'visited');
            }

            btClose.on('click', function(e) {
                e.preventDefault();
                about.removeClass('active');
            });

            bt.on('click', function(e) {
                e.preventDefault();
                if( !about.hasClass('active') ) {
                    about.addClass('active');
                } else {
                    about.removeClass('active');
                }
            });

        }

    };

    Insta.App.init();

})(this);