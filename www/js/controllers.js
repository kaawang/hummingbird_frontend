angular.module('starter.controllers', [])

// .config(function($authProvider) {
//   $authProvider.configure({
//     apiUrl: 'http://localhost:3000' //your api's url
//   });
// })

.controller('AppCtrl', function($scope, $ionicModal, $state) {
  // OAUTH SIGN OUT
  $scope.logout = function() {
  //   $auth.signOut()
  //   .then(function(resp) {
    window.localStorage.clear();
  //     console.log("WUNDABAR!!!");
  $state.go('login');
    // })
  //   .catch(function(resp) {
  //     console.log("SOMETHING TERRIBLE HAS HAPPENED in the AppCtrl");
  console.log("in $scope.logout")
  //   });
};
})


.controller('EnterUserPhoneCtrl', function($scope, $http, $state) {
  $scope.message = {};

  $scope.sendVerificationCode = function(message){
    var userId = window.localStorage['user_id'];
    console.log("user id " + userId);
    var data = {
      number: message.contact,
      user_id: userId
    };
    console.log(data);
    // Need new way to set this
    // post route to backend

    var req = {
      method: 'POST',
      url: 'http://localhost:3000/users/'+userId+'/send_verification_code',
      data: data
    };

    $http(req)
    .success(function(response){
      console.log(response);
      $state.go('app.verify_code');
    })
    .error(function(response){
      console.log(response);
    });
  };
})

.controller('VerifyCodeCtrl', function($scope, $http, $state) {
  $scope.verifyCode = function(verificationCode){
    var userId = window.localStorage['user_id'];
    var data = {
      number: verificationCode,
      user_id: userId
    };
    console.log(data);

    var req = {
      method: 'POST',
      url: 'http://localhost:3000/users/'+userId+'/verify_code',
      data: data
    };
    // make sure backend returns a JSON with verification state
    // handle state from there.
    $http(req)
    .success(function(response){
      if (response.phone_verified === true) {
        $state.go('app.new_message');
      } else {
        $state.go('app.verify_code');
      }
    })
    .error(function(response){
      console.log(response);
    });
  };
})



// post new message
.controller('NewMessageCtrl', function($scope, $http, $state, $ionicPopup, $timeout) {

  // if (window.localStorage['activeSession'] !== "true"){
    if (!window.localStorage['user_id']) {
    $state.go('login');
  }
  $scope.message = {};
// =========================================

var date = new Date();
var dateArray = date.toString().split(" ");
if (dateArray[1] === "Oct" || dateArray[1] === "Nov" || dateArray[1] === "Dec") {
  var month = "-1";
} else {
  var month = "-0";
}
$scope.dateString = dateArray[3] + month + (date.getMonth()+1) + "-" + dateArray[2]

// ============================================

$scope.scheduleMessage = function(message){
  var userId = window.localStorage['user_id']
  var data = {
    number: message.contact,
    body: message.content,
    send_at_datetime: message.date,
    user_id: userId
  };
  console.log(data);
    // post route to backend
    var req = {
      method: 'POST',
      url: 'http://localhost:3000/users/'+userId+'/messages',
      data: data
    };

    if (data.send_at_datetime < date ) {
     var messageScheduledConfirmation = $ionicPopup.show({
       title: 'That\'s in the past :('
     });
     $timeout(function(){
       messageScheduledConfirmation.close();
     }, 2000);
   } else {
    console.log("making requests");

    $http(req)
    .success(function(response) {
      var messageScheduledConfirmation = $ionicPopup.show({
        title: 'Scheduled!'
      });
      $timeout(function(){
        messageScheduledConfirmation.close();
      }, 2000);
      $scope.message = {};
    })
    .error(function(response) {
      console.log("error message from new message");
    });
  };
}
})

.controller('LoginCtrl', function($scope, $state, $http, $ionicPopup, $timeout) {
  //OAUTH SIGN IN
  // later, consider changing this to phone_verified
  if (window.localStorage['user_id']){
    $state.go('app.new_message');
  }
  $scope.register = function() {
    var inputs = document.getElementsByTagName('input')
    console.log(inputs)
    var email = inputs[0].value
    var password = inputs[1].value
    // These variable names should be revised, because BCrypt
    var data = { email: email, password: password }
    console.log(data)

    // var userId = window.localStorage['user_id'];
    // debugger
    // not sure we need this here since it isn't being passed to create
    // but we need this if we do Users#Login which does /users/:id/login

    request = {
      method: "POST",
      url: 'http://localhost:3000/users',
      data: data
      // dataType: 'json'
    };
    console.log("ajax request: " + request)

    $http(request)
    .success(function(response) {
      console.log( "AJAX response: " + response);

      if (response.id) {
        $state.go('app.enter_user_phone');
        window.localStorage['user_id'] = response.id
        console.log("session is :" + localStorage['user_id'])
      } else {
        $state.go('login');
        var registrationFailure = $ionicPopup.show({
       title: "User already exists (so login!)\'...or email/password combination isn't valid."
     });
     $timeout(function(){
       registrationFailure.close();
     }, 2000);
        // How do we do error handling with Angular forms?
        console.log("need to show some error handling on this form");
      }
    })
  }
// NOTE: Above function only works for new users. Need to rewrite login function.


$scope.login = function() {
  console.log("login function invoked");
  var inputs = document.getElementsByTagName('input')
  console.log(inputs)
  var email = inputs[0].value
  var password = inputs[1].value
  // debugger

  var userId = window.localStorage['user_id']
  console.log("on form submission, localstorage id is " + userId)
  var data = {email: email, password: password}//, user_id: userId}
  console.log(data)

  request = {
    method: "POST",
    url: 'http://localhost:3000/users/' + userId + '/login',
    data: data
      // dataType: 'json'
    };
    console.log(request);

    $http(request)
    .success(function(response, userId) {
      console.log(response);
      console.log("id from server is: " + response.id + " and it is type " + typeof(response.id)) // This returns 25 (the User id from the database and is a string)
      console.log("localStorage id is: " + userId + " and it is type " + typeof(userId)) // This returns 200 and is a number
      var conditional = (response.id === parseInt(userId, 10)); // this returns false
      console.log("if conditional result is: " + conditional);
      if (response.id === parseInt(userId, 10)) {
        console.log("in if statement");
        userId = response.id;
        window.localStorage = userId;
        console.log(window.localStorage);
        // nothing in this if statement happens after the first console log
        // ... but then if you click login again it goes to new_message
        $state.go('app.new_message');
      } else {
        $state.go('login');
        var loginFailure = $ionicPopup.show({
       title: "Your email/password combination isn't valid. Please try again."
     });
     $timeout(function(){
       loginFailure.close();
     }, 2000);
        // How do we do error handling with Angular forms?
        console.log("in else conditional");
      }
    })
  }
// Old OAuth function
//     // $auth.authenticate('google')
//     // .then(function(resp) {
//     //   window.localStorage['user_id'] = resp.id;
//     //   window.localStorage['activeSession'] = true;
//     //   if (resp.phone_verified === "false") {
//     //     $state.go('app.enter_user_phone');
//     //   } else if (resp.phone_verified === "true") {
//     //     $state.go('app.new_message');
//     //   }
//     // })
//     // .catch(function(resp) {
//     //   console.log("error");
//     // });

  // $scope.activeSession = function(){
  //   return window.localStorage['activeSession'] === "true";
  // };
})


.controller('ScheduledCtrl', function($scope, $state, $http) {

  $scope.refreshScheduled = function(){
    var getScheduled = {
      method: 'GET',
      url: 'http://localhost:3000/users/'+localStorage.user_id+'/messages?sent=false',
    };

    $http(getScheduled)
    .success(function(response) {
      $scope.scheduledMessages = response.messages;
    })
    .error(function(response) {
      console.log(response);
    })
    .finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.deleteMessage = function(message) {
    $scope.scheduledMessages.splice($scope.scheduledMessages.indexOf(message), 1);
    $http({
      method: 'DELETE',
      url: 'http://localhost:3000/users/'+localStorage.user_id+'/messages/'+message.id,
    }).success(function() {console.log("success!");
  })
  }



})

.controller('DeliveredCtrl', function($scope, $state, $http) {
  $scope.refreshDelivered = function(){
    var getDelivered = {
      method: 'GET',
      url: 'http://localhost:3000/users/'+localStorage.user_id+'/messages?sent=true',
    };

    $http(getDelivered)
    .success(function(response) {
      $scope.deliveredMessages = response.messages.reverse();
    })
    .error(function(response) {
      console.log(response);
    })
    .finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
  $scope.deleteMessage = function(message) {
    $scope.deliveredMessages.splice($scope.deliveredMessages.indexOf(message), 1);
    $http({
      method: 'DELETE',
      url: 'http://localhost:3000/users/'+localStorage.user_id+'/messages/'+message.id,
    }).success(function() {
      console.log("success!");
    })
  }
})
