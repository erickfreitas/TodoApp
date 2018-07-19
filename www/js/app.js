//Criando uma biblioteca(modulo) utilizando a lib do ionic
var app = angular.module('todoapp', ['ionic', 'ngCordova']);

//Criando rotas e definindo a rota primária
app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider.state('list', {
    cache: false,
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

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });

  $urlRouterProvider.otherwise('login');

});

var db = null;

//Executa quando inicia o app (igual ao método main do c#)
app.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }    
    if(window.cordova){
      db = $cordovaSQLite.OpenDB({ name: 'tarefas'});
      console.log('Db criado no dispositivo');
    }
    else{
      db = window.openDatabase('tarefas.db', '1', 'Tarefas db', 200000);
      console.log('Db criado no navegador');
    }
    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS tarefas (id integer primary key, texto text, concluida integer)')
    .then(function(){
      console.log('tabela criada');
    });
  });
});

app.controller('LoginCtrl', function($scope, $http, $state, $ionicHistory, $ionicPopup){
  $scope.usuario = { };

  $scope.login = function(){
    $http.post('http://localhost:3004/api/usuario', $scope.usuario).then(function(response){
      if(response.status == 200){
        //Salvando dados do usuario no localStorage
        window.localStorage.setItem('usuario', JSON.stringify(response.data));
        //Configurando a view para não mostrar o botão de voltar a página 
        $ionicHistory.nextViewOptions({
          disableBack: true
        });

        $state.go('list');
      }
    }, function(response){
      $ionicPopup.alert({
        title: 'Falha no acesso',
        template: 'Usuário ou senha inválidos'
      })
    });
  };
});

app.controller('ListaCtrl', function($scope, $state, TarefaService, TarefaWebService, TarefaServiceSqlite){

  TarefaServiceSqlite.lista().then(function(response){
    $scope.tarefas = response;
  });

  $scope.concluir = function(indice, tarefa){
    TarefaWebService.concluir(indice, tarefa).then(function(){
      TarefaWebService.lista().then(function(response){
        $scope.tarefas = response;
      });
    });
  }

  $scope.apagar = function(indice){
    TarefaWebService.apagar(indice).then(function(){
      TarefaWebService.lista().then(function(response){
        $scope.tarefas = response;
      });
    });
  }

  $scope.editar = function(indice){
    $state.go('edit', {indice : indice});
  }
});

app.controller('NovoCtrl', function($scope, $state, TarefaWebService, TarefaServiceSqlite){

  $scope.tarefa = {
    "texto" : '', // <input ng-model="texto" ..
    "data" : new Date(),
    "feita" : false
  };
  
  $scope.salvar = function(){
    TarefaServiceSqlite.inserir($scope.tarefa).then(function(){
      $state.go('list');
    });    
  }
});

app.controller('EditarCtrl', function($scope, $state, $stateParams, TarefaWebService, TarefaServiceSqlite){
  $scope.indice = $stateParams.indice;

  TarefaServiceSqlite.obtem($scope.indice).then(function(response){
    $scope.tarefa = response;
  });

  $scope.salvar = function(){
    TarefaWebService.alterar($scope.indice, $scope.tarefa).then(function(){
      $state.go('list');
    });    
  }

});

//Criando um serviço para manipular as tarefas usando localStorage
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

//Criando um serviço para manipular as tarefas através do webservice
app.factory('TarefaWebService', function($http, $q){
  var url = "http://localhost:3004/api/tarefa";

  var config = {
    headers : {
      'Authorization': JSON.parse(window.localStorage.getItem('usuario')).token
    }
  };

  return {
    lista: function(){
      var deferido = $q.defer();
      $http.get(url, config).then(function(response){
        deferido.resolve(response.data);
      });
      return deferido.promise;
    },
    obtem: function(indice){
      var deferido = $q.defer();
      $http.get(url + '/' + indice).then(function(response){
        deferido.resolve(response.data);
      });
      return deferido.promise;
    },
    inserir: function(tarefa){
      var deferido = $q.defer();
      $http.post(url, tarefa).then(function(){
        deferido.resolve();
      });
      return deferido.promise;
    },
    alterar: function(indice, tarefa){
      var deferido = $q.defer();
      $http.put(url + '/' + indice, tarefa).then(function(){
        deferido.resolve();
      });
      return deferido.promise;
    },
    concluir: function(indice, tarefa){
      tarefa.feita = true;
      var deferido = $q.defer();
      $http.put(url + '/' + indice, tarefa).then(function(){
        deferido.resolve();
      });
      return deferido.promise;
    },
    apagar: function(indice){
      var deferido = $q.defer();
      $http.delete(url + '/' + indice).then(function(){
        deferido.resolve();
      });
      return deferido.promise;
    }
  }
});

//Criando um serviço para manipular as tarefas utilizando Sqlite
app.factory('TarefaServiceSqlite', function($q, $cordovaSQLite){
  return {
    lista: function(){
      var deferido = $q.defer();
      var query = 'SELECT id, texto, concluida FROM tarefas';
      $cordovaSQLite.execute(db, query).then(function(dados){
        var tarefas = [];
        for(var i = 0; i < dados.rows.length; i++){
          var tarefa = {
            'id': dados.rows.item(i).id,
            'texto': dados.rows.item(i).texto,
            'feita': dados.rows.item(i).concluida,
          };
          tarefas.push(tarefa);
        }
        deferido.resolve(tarefas);
      });
      return deferido.promise;
    },
    obtem: function(indice){
      var deferido = $q.defer();
      var query = 'SELECT id, texto, concluida FROM tarefas WHERE id = ?';
      $cordovaSQLite.execute(db, query, [indice]).then(function(dados){
        var tarefa = {
          'id': dados.rows.item(0).id,
          'texto': dados.rows.item(0).texto,
          'feita': dados.rows.item(0).concluida,
        };
        deferido.resolve(tarefa);
      });
      return deferido.promise;
    },
    inserir: function(tarefa){
      var deferido = $q.defer();
      var query = 'INSERT INTO tarefas (texto, concluida) VALUES (?, ?)';
      $cordovaSQLite.execute(db, query, [tarefa.texto, tarefa.feita])
      .then(function(response){
        console.log('Id criado ' + response.insertId);
      });
      return deferido.promise;
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