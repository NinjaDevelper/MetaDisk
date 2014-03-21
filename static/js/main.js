// Generated by CoffeeScript 1.4.0
(function() {
  var Cookies, GIGABYTE, History, api, handleFileUploaded, loadStats, selectElementText, showUploadStage, uploadFile;

  uploadFile = function(cb) {
    return cb();
  };

  api = function(resource) {
    return 'http://node2.storj.io/api/' + resource;
  };

  GIGABYTE = 1024 * 1024 * 1024;

  Cookies = {
    set: (function(k, v, days) {
      var date, expires, secs;
      if (days) {
        date = new Date();
        secs = days * 24 * 60 * 60 * 1000;
        date.setTime(date.getTime() + secs);
        expires = '; expires=' + date.toGMTString() + '; max-age=' + secs;
      } else {
        expires = '';
      }
      return document.cookie = k + '=' + v + expires + '; path=/';
    }),
    get: (function(k) {
      var cookie, cookies, index, name, v, _i, _len, _ref;
      cookies = document.cookie.split(';');
      for (_i = 0, _len = cookies.length; _i < _len; _i++) {
        cookie = cookies[_i];
        cookie = cookie.trim();
        index = cookie.indexOf('=');
        _ref = [cookie.substring(0, index), cookie.substring(index + 1)], name = _ref[0], v = _ref[1];
        if (name === k) {
          return v;
        }
      }
      return null;
    }),
    kill: (function(k) {
      return this.set(k, '', -11);
    })
  };

  History = {
    add: (function(file) {
      var stuff;
      stuff = JSON.parse(Cookies.get('history'));
      stuff.push(file);
      return Cookies.set('history', JSON.stringify(stuff));
    }),
    get: (function() {
      return Cookies.get('history');
    }),
    kill: (function() {
      return Cookies.kill('history');
    })
  };

  loadStats = function() {
    $.getJSON(api('bandwidth/usage'), function(usage) {
      usage.current.incoming /= GIGABYTE;
      usage.current.outgoing /= GIGABYTE;
      return $.getJSON(api('bandwidth/limits'), function(limits) {
        if (limits.incoming === 0) {
          $('#bar-ul-bandwidth').css('width', '0%');
          $('#cont-ul-bandwidth').html(usage.current.incoming.toFixed(2) + '/&infin; GB');
        } else {
          limits.incoming /= GIGABYTE;
          $('#bar-ul-bandwidth').css('width', (usage.current.incoming / limits.incoming * 100) + '%');
          $('#cont-ul-bandwidth').text(usage.current.incoming.toFixed(2) + '/' + limits.incoming.toFixed(2) + ' GB');
        }
        if (limits.outgoing === 0) {
          $('#bar-dl-bandwidth').css('width', '0%');
          return $('#cont-dl-bandwidth').html(usage.current.outgoing.toFixed(2) + '/&infin; GB');
        } else {
          limits.outgoing /= GIGABYTE;
          $('#bar-dl-bandwidth').css('width', (usage.current.outgoing / limits.outgoing * 100) + '%');
          return $('#cont-dl-bandwidth').text(usage.current.outgoing.toFixed(2) + '/' + limits.outgoing.toFixed(2) + ' GB');
        }
      });
    });
    $.getJSON(api('storage/usage'), function(usage) {
      usage = usage.usage / GIGABYTE;
      return $.getJSON(api('storage/capacity'), function(capacity) {
        capacity = capacity.capacity / GIGABYTE;
        $('#bar-storage').css('width', (usage / capacity * 100) + '%');
        return $('#cont-storage').text(usage.toFixed(2) + '/' + capacity.toFixed(2) + ' GB');
      });
    });
    $.getJSON(api('dtc/address'), function(addr) {
      return $('#cont-datacoin-addr').html('<code>' + addr.address + '</code>').find('code').click(function() {
        return selectElementText($(this)[0]);
      });
    });
    $.getJSON(api('dtc/balance'), function(balance) {
      return $('#cont-datacoin-bal').text(balance.balance + ' DTC');
    });
    return $.getJSON(api('sync/status'), function(data) {
      var bcSize, cloudSize, size, x, _i, _j, _len, _len1, _ref, _ref1;
      cloudSize = 0;
      _ref = [
        (function() {
          var _j, _len, _ref, _results;
          _ref = data.cloud_queue;
          _results = [];
          for (_j = 0, _len = _ref.length; _j < _len; _j++) {
            x = _ref[_j];
            _results.push(x.filesize);
          }
          return _results;
        })()
      ];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        size = _ref[_i];
        cloudSize += size / GIGABYTE;
      }
      bcSize = 0;
      _ref1 = (function() {
        var _k, _len1, _ref1, _results;
        _ref1 = data.blockchain_queue;
        _results = [];
        for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
          x = _ref1[_k];
          _results.push(x.filesize);
        }
        return _results;
      })();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        size = _ref1[_j];
        bcSize += size / GIGABYTE;
      }
      $('#cont-sync-cloud').text(data.cloud_queue.length + ' (' + cloudSize.toFixed(2) + ' GB)');
      return $('#cont-sync-blockchain').text(data.blockchain_queue.length + ' (' + bcSize.toFixed(2) + ' GB)');
    });
  };

  loadStats();

  showUploadStage = function(stage) {
    $('#cont-upload').hide();
    $('#cont-uploaded').hide();
    $('#cont-uploading').hide();
    return $('#cont-' + stage).show();
  };

  selectElementText = function(el, win) {
    var doc, range, sel;
    win = win || window;
    doc = win.document;
    if (win.getSelection && doc.createRange) {
      sel = win.getSelection();
      range = doc.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      return sel.addRange(range);
    } else if (doc.body.createTextRange) {
      range = doc.body.createTextRange();
      range.moveToElementText(el);
      return range.select();
    }
  };

  handleFileUploaded = function(fname) {
    var $row;
    showUploadStage('uploaded');
    $row = $('<tr/>').addClass('new').append($('<td/>').text(fname)).append($('<td/>').html('<code>8c530825981d6f3240a2fcecbafa94859684e3a49c6a1d3205b51154de3f3547</code>')).append($('<td/>').html('<button class="btn btn-sm btn-primary">Download</button>'));
    $row.find('code').click(function() {
      return selectElementText($(this)[0]);
    });
    return $('#cont-file-list').prepend($row).find('tr').last().remove();
  };

  $('#cont-file-list tr code').click(function() {
    return selectElementText($(this)[0]);
  });

  $('#in-upload').change(function() {
    var fname, formData, progressHandler;
    console.log('what f;alskfj fuck');
    showUploadStage('uploading');
    console.log('wsdjf;adlksjf');
    fname = $(this).val().split('\\').pop();
    console.log('a298taioj');
    formData = new FormData($('#form-file-upload')[0]);
    console.log('what theas;dlkjf;alskfj fuck');
    $('#span-up-prog').css('width', '0%').text('0%');
    console.log('asdfwhat the fuck');
    progressHandler = function(e) {
      var perc;
      perc = e.loaded / e.total * 100;
      return $('#span-up-prog').css('width', perc + '%').text(Math.round(perc) + '%');
    };
    return $.ajax({
      url: api('upload'),
      type: 'POST',
      xhr: (function() {
        var xhr;
        xhr = $.ajaxSettings.xhr();
        if (xhr.upload) {
          xhr.upload.addEventListener('progress', progressHandler, false);
        }
        return xhr;
      }),
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success: (function(data) {
        console.log(data);
        return handleFileUploaded(fname);
      })
    });
  });

  $('#span-dl-link').focus(function() {
    return $(this).select();
  });

  $('#span-dl-link').click(function() {
    return $(this).select();
  });

  $('#btn-upload-another').click(function() {
    return showUploadStage('upload');
  });

}).call(this);
