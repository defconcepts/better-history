describe('Context Menus', function() {
  var domain = 'code.google.com';

  beforeEach(function() {
    chrome = {
      contextMenus: {
        create: jasmine.createSpy('create').andReturn(true),
        update: jasmine.createSpy('update')
      },
      tabs: {
        create: jasmine.createSpy('create'),
        get: jasmine.createSpy('get').andCallFake(function(id, callback) {
          callback({url: 'http://' + domain + '/projects'});
        }),
        onSelectionChanged: {addListener: jasmine.createSpy('addListener')},
        onUpdated: {addListener: jasmine.createSpy('addListener')}
      }
    };
  });

  describe('SelectionContextMenu', function() {
    var selectionContextMenu, selection = 'text here';

    beforeEach(function() {
      selectionContextMenu = new SelectionContextMenu();
    });

    describe('#create', function() {
      it('creates a selection context menu', function() {
        selectionContextMenu.create();
        expect(chrome.contextMenus.create).toHaveBeenCalledWith({
          title: 'Search in history',
          contexts: ['selection'],
          onclick: selectionContextMenu.onClick
        });
      });

      it('stores the menu', function() {
        selectionContextMenu.create();
        expect(selectionContextMenu.menu).toBeDefined();
      });
    });

    describe('#onClick', function() {
      it('opens a tab to search by the selection', function() {
        selectionContextMenu.onClick({selectionText: selection});
        expect(chrome.tabs.create).toHaveBeenCalledWith({
          url: 'chrome://history/#search/' + selection
        });
      });
    });
  });

  describe('PageContextMenu', function() {
    var pageContextMenu;

    beforeEach(function() {
      pageContextMenu = new PageContextMenu();
    });

    describe('#create', function() {
      it('creates a page context menu', function() {
        pageContextMenu.create();
        expect(chrome.contextMenus.create).toHaveBeenCalledWith({
          title: 'Visits to domain',
          contexts: ['page'],
          onclick: pageContextMenu.onClick
        });
      });

      it('stores the menu', function() {
        pageContextMenu.create();
        expect(pageContextMenu.menu).toBeDefined();
      });
    });

    describe('#onClick', function() {
      it('opens a tab to search by the domain', function() {
        pageContextMenu.onClick({pageUrl: 'http://' + domain + '/projects'});
        expect(chrome.tabs.create).toHaveBeenCalledWith({
          url: 'chrome://history/#search/' + domain
        });
      });
    });

    describe('#updateTitleDomain', function() {
      it('updates the title domain from the passed tab', function() {
        pageContextMenu.updateTitleDomain({url: 'http://' + domain + '/projects'});
        expect(chrome.contextMenus.update).toHaveBeenCalledWith(pageContextMenu.menu, {
          title: 'Visits to ' + domain
        });
      });
    });

    describe('#listenToTabs', function() {
      it('listens to selection change', function() {
        pageContextMenu.listenToTabs();
        chrome.tabs.onSelectionChanged.addListener.mostRecentCall.args[0]();
        expect(chrome.contextMenus.update).toHaveBeenCalled();
      });

      it('listens to tab updates', function() {
        pageContextMenu.listenToTabs();
        chrome.tabs.onUpdated.addListener.mostRecentCall.args[0](true, true, {selected:true, url:'http://' + domain + '/projects'});
        expect(chrome.contextMenus.update).toHaveBeenCalled();
      });
    });

    describe('#onTabUpdated', function() {
      it('updates the title domain when the tab is selected', function() {
        pageContextMenu.onTabUpdated({selected: true, url: 'http://' + domain + '/projects'});
        expect(chrome.contextMenus.update).toHaveBeenCalled();
      });

      it('does not update the title domain when the tab is not selected', function() {
        pageContextMenu.onTabUpdated(true, true, {selected: false});
        expect(chrome.contextMenus.update).not.toHaveBeenCalled();
      });
    });

    describe('#onTabSelectionChanged', function() {
      var id = 1;

      it('gets the tab from the passed id', function() {
        pageContextMenu.onTabSelectionChanged(id);
        expect(chrome.tabs.get).toHaveBeenCalledWith(id, jasmine.any(Function));
      });

      it('updates the title domain', function() {
        pageContextMenu.onTabSelectionChanged(id);
        expect(chrome.contextMenus.update).toHaveBeenCalled();
      });
    });
  });
});