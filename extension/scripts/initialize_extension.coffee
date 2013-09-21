window.errorTracker = new BH.Trackers.ErrorTracker(Honeybadger)
window.analyticsTracker = new BH.Trackers.AnalyticsTracker(_gaq)

try
  window.syncStore = new BH.Lib.SyncStore
    chrome: chrome
    tracker: analyticsTracker

  window.localStore = new BH.Lib.LocalStore
    chrome: chrome
    tracker: analyticsTracker

  new BH.Lib.DateI18n().configure()

  settings = new BH.Models.Settings({})
  state = new BH.Models.State({}, settings: settings)
  settings.fetch
    success: =>
      state.fetch
        success: =>
          state.updateRoute()

          window.router = new BH.Router
            settings: settings
            state: state
            tracker: analyticsTracker

          Backbone.history.start()

  syncStore.get ['mailingListPromptTimer', 'mailingListPromptSeen'], (data) ->
    mailingListPromptTimer = data.mailingListPromptTimer || 3
    mailingListPromptSeen = data.mailingListPromptSeen
    unless mailingListPromptSeen?
      if mailingListPromptTimer == 1
        new BH.Views.MailingListView().open()
        syncStore.remove 'mailingListPromptTimer'
        syncStore.set mailingListPromptSeen: true
        analyticsTracker.mailingListPrompt()
      else
        syncStore.set mailingListPromptTimer: (mailingListPromptTimer - 1)

  syncStore.get 'tagInstructionsDismissed', (data) ->
    tagInstructionsDismissed = data.tagInstructionsDismissed || false
    unless tagInstructionsDismissed
      $('body').addClass('new_tags')
catch e
  errorTracker.report e