var defaultSettings = {
    authority: 'http://cas1:8080/cas',
    authority_proxy1: 'http://localhost:9090/cas',
    authority_proxy2: 'http://localhost:9191/cas',
    client_id: 'test',
    client_secret: 'test',
    response_type: 'code',
    scope: 'openid',
    redirect_uri: window.location.protocol + '//' + window.location.host,
    token : false
};

var settings,
    protocolUrl,
    tokenUrl,
    authUrl,
    userInfoUrl,
    logoutUrl,
    loginResponse,
    action,
    code;

function init() {
    var params = new URLSearchParams(window.location.search);
    var queryParamCode = params.get('code');
    //remove code from URL
    if (queryParamCode) {
        localStorage.setItem('code', queryParamCode);
    }

    $('#app-setting-input').tooltip({'trigger':'focus'});
    $('#app-setting-input').on("click", function () {
        $(this).select();
    });

    var cookieCode = localStorage.getItem('code');
    if (cookieCode) {
        code = cookieCode;
        $('#request').val(
`Oh!

code: ${code}

Looks like the user logged in and the issuer redirected to this page with a query parameter 'code'.

Now you have an authorization code. Click on the "Get Tokens" button. This will prepare a request that will use the authentication code to fetch an access token.`);
    }

    var error = params.get('error');
    if (error) {
        var errorDescription = params.get('error_description');
        $('#request').val(
            `Oops!

error: ${error}
error_description: ${errorDescription}

Looks like the request was denied by the issuer and redirected to this page with a query parameter 'error' and 'error_description'.

Please check your settings and try again.`);
    }

    getSettingsInLocalStorage();
    loadSettingsIntoUI();
    pullSettingsFromUI();
    testIssuerURL();
    buttonStates();

    loginResponse = {};
}

function buttonStates() {

  console.log('execute buttonStates()');

  if (code) {
    disableToken(false);
  } else {
    disableToken(true);
  }

  if (settings.token === false) {
    disableProfile(true);
    disableAccount(true);
    disableLogout(true);
  } else {
    disableProfile(false);
    disableAccount(false);
    disableLogout(false);
  }
}

function getTokens() {
    // detect if authenticated
    if (code) {
        var tokenRequest = {
            code: code,
            grant_type: 'authorization_code',
            client_id: settings.client_id,
            redirect_uri: settings.redirect_uri
        };

        if (settings.client_secret.trim() !== '') {
          tokenRequest.client_secret = settings.client_secret;
        }

        var postBody = postBodyEncode(tokenRequest).replace(/\&/g, "&\n");
        var request =
          `Request Method: POST
          Request URL: ${tokenUrl}
          Post Body:
          ${postBody}
          `;
        $('#request').val(request);
        $('#response').val('');

        action = function () {
            $.post(tokenUrl, tokenRequest)
                .done(function (data) {
                    settings.token = data;
                    $('#response').val(JSON.stringify(data, null, '    '));

                    try {
                      $('#decoded-token').val(JSON.stringify(jwt_decode(data.access_token), null, '    '));
                    } catch (e) {
                      console.log('error=' + e);
                    }

                    saveSettingsInLocalStorage();
                })
                .fail(function (data, status, error) {
                    settings.token = false;
                    console.log('data=' + data)
                    console.log('error=' + error)
                    console.log('status=' + status)

                    var stringData = JSON.stringify({data: data, status: status, error: error}, null, '    ');
                    $('#response').val(
                        `Something failed. The client_id you're using has not been configured properly and might be encountering CORS issues in the browser. This is what the response contained:
                    ${stringData}
                    `);

                })
                .always(function (data, o) {
                    buttonStates();
                });
        }
    }
}

function login() {
    var authParams = {
        client_id: settings.client_id,
        redirect_uri: settings.redirect_uri,
        scope: settings.scope,
        response_type: settings.response_type
    }
    var requestURL = authUrl + "?\n" + $.param(authParams).replace(/\&/g, "&\n");
    var request =
`Request Method: GET
Request URL: ${requestURL}`;

    $('#request').val(request);
    $('#response').val('');

    action = function () {
        window.location = authUrl + '?' + $.param(authParams);
    };
}



function getProfile1() {
    profileRequest = settings.token;
    var request =
    `Request method: GET
    Request URL: ${userInfoUrl1}
    Request Headers:
      Authorization: Bearer ${settings.token.access_token}
    `;
    $('#request').val(request);
    $('#response').val('');

    action = function () {
        var x = $.get(userInfoUrl1, profileRequest)
            .done(function (data) {
            })
            .fail(function (data) {
            })
            .always(function (data, status, xhr) {
                $('#response').val(JSON.stringify(data, null, '    '));
            });
    }
}

function getProfile2() {
    profileRequest = settings.token;
    var request =
    `Request method: GET
    Request URL: ${userInfoUrl2}
    Request Headers:
      Authorization: Bearer ${settings.token.access_token}
    `;
    $('#request').val(request);
    $('#response').val('');

    action = function () {
        var x = $.get(userInfoUrl2, profileRequest)
            .done(function (data) {
            })
            .fail(function (data) {
            })
            .always(function (data, status, xhr) {
                $('#response').val(JSON.stringify(data, null, '    '));
            });
    }
}

function getProfilePOST() {
    profileRequest = settings.token;
    var postBody = postBodyEncode(profileRequest).replace(/\&/g, "&\n");
    var request =
    `Request method: POST
    Request URL: ${userInfoUrl}

    Request Headers:
      Authorization: Bearer ${settings.token.access_token}
    `;
    $('#request').val(request);
    $('#response').val('');

    action = function () {
        var x = $.post(userInfoUrl, profileRequest)
            .done(function (data) {
            })
            .fail(function (data) {
            })
            .always(function (data, status, xhr) {
                $('#response').val(JSON.stringify(data, null, '    '));
            });
    }
}

function showAccount() {
    var requestURL = settings.authority + "/account/applications";
    var request =
`Request Method: GET
Request URL: ${requestURL}
`;

    $('#request').val(request);
    $('#response').val('');

    action = function () {
        window.location = requestURL;
    };
}

function logout() {
    var authParams = {
        client_id: settings.client_id,
        redirect_uri: settings.redirect_uri,
        scope: settings.scope,
        response_type: settings.response_type
    }

    var requestURL = logoutUrl + "?\n" + $.param(authParams).replace(/\&/g, "&\n");
    var request =
`Request Method: GET
Request URL: ${requestURL}
Request Headers:
  Authorization: Bearer ${settings.token.access_token}
`;
    $('#request').val(request);
    $('#response').val('');
    action = function () {
        localStorage.removeItem('code');
        settings.token = false;
        saveSettingsInLocalStorage();
        window.location = logoutUrl + '?' + $.param(authParams);
    }
}

// ui binding functions for settings
function executeRequest() {
  if (action) {
    action();
  } else {
    $('#request').val(`Select an action from above before clicking Go`);
  }
}

function testAndSaveSettings() {
  var test = testIssuerURL();
  test
  .always(function(){
      pullSettingsFromUI();
      saveSettingsInLocalStorage();
      markAsSaved();
    });
}

function disableToken(disable) {
  $('#button-token').prop('disabled', disable);
}

function disableLogout(disable) {
  $('#button-logout').prop('disabled', disable);
}

function disableProfile(disable) {
  $('#button-profile1').prop('disabled', disable);
  $('#button-profile2').prop('disabled', disable);
}

function disableAccount(disable) {
  $('#button-account').prop('disabled', disable);
}

function pullSettingsFromUI() {
  settings.authority = $('#authority').val();
  settings.authority_proxy1 = $('#authority_proxy1').val();
  settings.authority_proxy2 = $('#authority_proxy2').val();
  settings.client_id = $('#client_id').val();
  settings.client_secret = $('#client_secret').val();
  settings.response_type = $('#response_type').val();
  settings.scope = $('#scope').val();
  settings.redirect_uri = $('#redirect_uri').val();

  //protocolUrl = settings.authority + '/protocol/openid-connect';
  protocolUrl = settings.authority;
  protocolUrl_proxy1 = settings.authority_proxy1;
  protocolUrl_proxy2 = settings.authority_proxy2;
  tokenUrl = protocolUrl_proxy2 + '/oidc/accessToken';
  authUrl = protocolUrl + '/oidc/authorize';
  userInfoUrl1 = protocolUrl_proxy1 + '/oidc/profile';
  userInfoUrl2 = protocolUrl_proxy2 + '/oidc/profile';
  logoutUrl = protocolUrl_proxy1 + '/logout';
}

function loadSettingsIntoUI() {
    $('#authority').val(settings.authority);
    $('#authority_proxy1').val(settings.authority_proxy1);
    $('#authority_proxy2').val(settings.authority_proxy2);
    $('#client_id').val(settings.client_id);
    $('#client_secret').val(settings.client_secret);
    $('#response_type').val(settings.response_type);
    $('#scope').val(settings.scope);
    $('#redirect_uri').val(settings.redirect_uri);
    $('#app-setting-input').val(JSON.stringify(settings));
    if (settings.token) {
      $('#decoded-token').val(JSON.stringify(jwt_decode(settings.token.access_token), null, '    '));
    }
}

function loadDefaultSettings() {
  settings = $.extend({}, defaultSettings);
  loadSettingsIntoUI();
  saveSettingsInLocalStorage();
  markAsSaved();
}

function saveSettingsInLocalStorage() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function getSettingsInLocalStorage() {
    settings = localStorage.getItem('settings');

    if (!settings) {
        settings = $.extend({}, defaultSettings);
        saveSettingsInLocalStorage();
    } else {
        settings = JSON.parse(settings);
    }
}

function connectionGood() {
  var button = $('#test-issuer');
  button
    .removeClass('btn-warning btn-danger')
    .addClass('btn-success');

  $('.glyphicon', button)
    .removeClass('glyphicon-thumbs-down')
    .addClass('glyphicon-thumbs-up');
}

function connectionFailed() {
  var button = $('#test-issuer');
  button
    .removeClass('btn-warning btn-success')
    .addClass('btn-danger');
  $('.glyphicon', button)
    .removeClass('glyphicon-thumbs-up')
    .addClass('glyphicon-thumbs-down');
}

function testIssuerURL() {
  return $.ajax({
    url: $('#authority').val(),
    dataType: 'json',
    type: 'GET'
  })
  .done(function() { connectionGood(); })
  .fail(function() { connectionFailed(); });
}

function inputChanged(el) {
  var id = $(el).attr('id');
  var val = $(el).val();
  var div = $(el).closest('div');
  if (settings[id] != val) {
    div.removeClass('bg-success').addClass('bg-warning');
  } else {
    div.removeClass('bg-warning').addClass('bg-success');
  }
  pullSettingsFromUI();
  $('#app-setting-input').val(JSON.stringify(settings));
}

function authorityChanged(el) {
  inputChanged(el);
  testIssuerURL();
}

function authorityProxyChanged(el) {
  inputChanged(el);
}

function appSettingsChanged() {
    var appSettings = $('#app-setting-input').val();
    if (!settings) {
        settings = $.extend({}, defaultSettings);
        saveSettingsInLocalStorage();
    } else {
        settings = JSON.parse(appSettings);
    }
    loadSettingsIntoUI();
    pullSettingsFromUI();
}

function markAsSaved() {
  var controls = $('#app-settings .form-control');
  controls.closest('div').removeClass('bg-warning').addClass('bg-success');
}

function postBodyEncode(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

init();
