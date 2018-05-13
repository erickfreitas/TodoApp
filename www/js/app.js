//Criando uma biblioteca(modulo) utilizando a lib do ionic
var app = angular.module('todoapp', ['ionic']);

//Criando rotas e definindo a rota primária
app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider.state('list', {
    url: '/list',
    templateUrl: 'templates/lista.html'
  });

  $stateProvider.state('new', {
    url: '/new',
    templateUrl: 'templates/novo.html'
  });

  $urlRouterProvider.otherwise('list');

});

//Executar quando inicia o app (igual ao método main do c#)
app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

var tarefas = [
  {
    "texto" : "Realizar as atividades do curso",
    "data" : new Date(),
    "feita" : false
  },
  {
    "texto" : "Passear com o cachorro",
    "data" : new Date(),
    "feita" : true
  }
];

app.controller('ListaCtrl', function($scope){

  $scope.tarefas = tarefas;

  $scope.concluir = function(indice){
    $scope.tarefas[indice].feita = true;
  }

  $scope.apagar = function(indice){
    $scope.tarefas.splice(indice, 1);
  }
});

app.controller('NovoCtrl', function($scope){

  $scope.salvar = function(){
    var tarefa = {
      "texto" : $scope.texto, // <input ng-model="texto" ..
      "data" : new Date(),
      "feita" : false
    };

    tarefas.push(tarefa);
  }
});
