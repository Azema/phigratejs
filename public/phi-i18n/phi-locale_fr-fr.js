'use strict';

/* jshint ignore:start */
angular.module("phi.i18n", [], ["$provide", function($provide) {
  $provide.constant("I18N.MESSAGES", {
    'error.global': 'Erreur: {{message}}',
    'errors.route.changeError':'Erreur lors du changement de route',
    'crud.user.save.success':"L'utilisateur avec l'ID '{{id}}' a été sauvé avec succès.",
    'crud.user.save.error':"Une erreur est apparue lors de l'enregistrement de l'utilisateur...",
    'crud.user.remove.success':"L'utilisateur avec l'ID '{{id}}' a été supprimé avec succès.",
    'crud.user.remove.error':"Une erreur est apparue lors de la suppression de l'utilisateur avec l'ID '{{id}}'.",
    'crud.projects.save.success':"Le projet '{{title}}' a été sauvé avec succès.",
    'crud.projects.save.error':"Une erreur est apparue lors de l'enregistrement du projet...",
    'crud.projects.remove.success':"Le projet '{{title}}' a été supprimé avec succès.",
    'crud.projects.remove.error':"Une erreur est apparue lors de la suppression du projet '{{title}}'.",
    'crud.projects.refresh.success':"Le projet '{{title}}' a été rafraichit avec succès.",
    'crud.projects.refresh.error':"Une erreur est apparue lors du rafraichissement du projet '{{title}}': {{message}}.",
    'crud.projects.refresh.all.success':"Les projets ont été rafraichit avec succès.",
    'crud.projects.refresh.all.error':"Une erreur est apparue lors du rafraichissement des projets: {{message}}.",
    'crud.projects.show.migration.error':"Migration impossible, le fichier n'existe pas.",
    'crud.projects.migrate.success':"Migration {{id}} réalisée avec succès.",
    'crud.projects.migrate.warning':"Migration impossible, le fichier n'existe pas.",
    'crud.projects.migrate.error':"Une erreur est apparue durant la migration.<br/>{{message}}",
    'login.reason.notAuthorized':"Vous n'avez pas les droits nécessaires. Voulez vous vous connecter avec un autre compte ?",
    'login.reason.notAuthenticated':"Vous devez être connecté pour acceder à cette partie de l'application.",
    'login.error.invalidCredentials': "Erreur de connection. Merci de vérifier vos informations et réessayez.",
    'login.error.serverError': "Il y a un problème avec l'authentification: {{exception}}.",
    'login.info': "Merci de renseigner vos informations de connexion",
    'menu.title.projects.create': 'Créer un projet',
    'menu.title.projects.list': 'Projets',
    'menu.signin': 'Connexion',
    'menu.signout': 'Déconnexion',
    'menu.register': 'Inscription',
    'form.register.fullname': 'Nom complet',
    'form.register.username': 'Nom d\'utilisateur',
    'form.register.password': 'Mot de passe',
    'form.register.password.repeat': 'Répeter le mot de passe',
    'form.register.signup': 'Inscription',
    'form.register.login': 'connexion',
    'form.register.infos': "",
    'btn-save': "Sauver",
    'btn-revert-changes': 'Restaurer',
    'btn-remove': 'Supprimer',
    'page.index.welcome': 'Bienvenue sur l\'interface de Phigrate',
    'projects.form.label.title': 'Nom',
    'projects.form.placeholder.title': 'Nom du projet',
    'projects.form.label.config_path': 'Path config',
    'projects.form.placeholder.config_path': 'Indiquer le chemin absolu du fichier application.ini',
    'projects.form.label.section': 'Section INI',
    'projects.form.placeholder.section': 'Indiquer le nom de votre section dans le fichier INI',
    'field-required': 'Ce champ est requis'
  });
}]);
/* jshint ignore:end */

/* vim: set ts=2 sw=2 et ai: */