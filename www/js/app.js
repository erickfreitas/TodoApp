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
    templateUrl: 'templates/novo.html',
    controller: 'NovoCtrl'
  });

  $stateProvider.state('edit', {
    url: '/edit/:indice',
    templateUrl: 'templates/novo.html',
    controller: 'EditarCtrl'
  });

  $urlRouterProvider.otherwise('list');

});

//Executa quando inicia o app (igual ao método main do c#)
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

app.controller('ListaCtrl', function($scope, $state, TarefaService){

  $scope.tarefas = TarefaService.lista();

  $scope.concluir = function(indice){
    TarefaService.concluir(indice);
  }

  $scope.apagar = function(indice){
    TarefaService.apagar(indice);
  }

  $scope.editar = function(indice){
    $state.go('edit', {indice : indice});
  }
});

app.controller('NovoCtrl', function($scope, $state, TarefaService){

  $scope.tarefa = {
    "texto" : '', // <input ng-model="texto" ..
    "data" : new Date(),
    "feita" : false
  };
  
  $scope.salvar = function(){
    TarefaService.inserir($scope.tarefa)
    $state.go('list');
  }
});

app.controller('EditarCtrl', function($scope, $state, $stateParams, TarefaService){
  $scope.indice = $stateParams.indice;
  $scope.tarefa = angular.copy(TarefaService.obtem($scope.indice));

  $scope.salvar = function(){
    TarefaService.alterar($scope.indice, $scope.tarefa)
    $state.go('list');
  }

});

//Criando um serviço para manipular as tarefas
app.factory('TarefaService', function(){
  //Buscando as tarefas do localStorage
  var tarefas = JSON.parse(window.localStorage.getItem('db_tarefas') || '[]');

  //Salvando tarefas no localStorage
  function persistir(){
    window.localStorage.setItem('db_tarefas', JSON.stringify(tarefas));
  }

  return {
    lista: function(){
      return tarefas;
    },
    obtem: function(indice){
      return tarefas[indice];
    },
    inserir: function(tarefa){
      tarefas.push(tarefa);
      persistir();
    },
    alterar: function(indice, tarefa){
      tarefas[indice] = tarefa;
      persistir();
    },
    concluir: function(indice){
      tarefas[indice].feita = true;
      persistir();
    },
    apagar: function(indice){
      tarefas.splice(indice, 1);
      persistir();
    }
  }
});