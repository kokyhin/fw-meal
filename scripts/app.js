(function(document) {
  window.overlay = {
    hide: function () {
      document.getElementById('loading-overlay').style.display = 'none';
    },
    show: function () {
      document.getElementById('loading-overlay').style.display = 'block';
    },
    toggle: function () {
      var element = document.getElementById('loading-overlay');
      var tmp = element.style.display === 'none' ? 'block':'none';
      document.getElementById('loading-overlay').style.display = tmp;
    }
  };

  var app  = document.querySelector('#app');
  app.user = null;

})(document);
