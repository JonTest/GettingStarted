// Custom Rally App that displays Stories in a grid.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

    // Entry Point to App
    launch: function() {

      console.log('our first app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      //this._loadData();                 // we need to prefix with 'this.' so we call a method found at the app level.


    // Explicitly create a Container
    this.pulldownContainer = Ext.create('Ext.container.Container', 
    {
        id: 'pulldown-container-id',

        layout: 
        {
            type: 'hbox',
            align: 'stretch'
        },

        width: 800,
        
       // border: 1,
        //style: {borderColor:'#000000', borderStyle:'solid', borderWidth:'1px'},
        
       // defaults: 
      //  {
            //labelWidth: 80,
            // implicitly create Container by specifying xtype
           // xtype: 'datefield',
         //   flex: 1,
           // style: 
           // {
                padding: '10px'
          //  }
       // },

       /* items: 
        [
          {
            xtype: 'datefield',
            name: 'startDate',
            fieldLabel: 'Start date'
          },

          {
            xtype: 'datefield',
            name: 'endDate',
            fieldLabel: 'End date'
          }
        ]
        */
    });

      this.add(this.pulldownContainer);
      this._loadIterations();
    },

    _loadIterations: function() 
    {
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox',
        {
          fieldLabel: 'Iteration',
          labelAlign: 'right',
          width: 200,

          listeners: 
          {
            // when iterations are loaded
            ready: function()
            {
              //console.log('ready', combobox);
              //console.log('chosen iteration', combobox.getRecord() );
              // old: this._loadData();

              this._loadSeverities();
            },

            select: function(combobox, records)
            {
              this._loadData();
            },

            scope: this
          }
        });



        this.pulldownContainer.add(this.iterComboBox);

    },

    _loadSeverities: function()
    {
       

       this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox',
        {
          field: 'Severity',
          model: 'Defect',
          
          fieldLabel: 'Severity',
          labelAlign: 'right',
          width: 200,

          listeners: 
          {
            // when first loaded
            ready: function()
            {
              //console.log('ready', combobox);
              //console.log('chosen iteration', combobox.getRecord() );
              this._loadData();
            },

            select: function(combobox, records)
            {
              this._loadData();
            },

            scope: this
          }
        });

        this.pulldownContainer.add(this.severityComboBox);

    },

    // Get data from Rally
    _loadData: function() 
    {
      var selectedIterationRef = this.iterComboBox.getRecord().get('_ref');
      console.log('selectedIterationRef', selectedIterationRef);

      var selectedSeverityValue = this.severityComboBox.getRecord().get('value');

      var myFilters =  
          [
            {
              property: 'Iteration',
              operation: '=',
              value: selectedIterationRef
            },
            {
              property: 'Severity',
              operation: '=',
              value: selectedSeverityValue
            }
          ];

      // if store exists, just load new data
      if (this.defectStore)
      {
          console.log('store exists');
          this.defectStore.setFilter(myFilters);
          this.defectStore.load();
      }
      else
      {
        // create store
        console.log('creating store');
        this.defectStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'Defect',
            autoLoad: true,                         // <----- Don't forget to set this to true! heh
            filters: myFilters,

            listeners: {
                load: function(myStore, myData, success) {
                    console.log('got data!', myStore, myData);
                    if (!this.myGrid)
                    {
                      this._createGrid(myStore);      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
                    }
                },
                scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
            },
            fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']   // Look in the WSAPI docs online to see all fields available!
          });
      }
    },

    // Create and Show a Grid of given stories
    _createGrid: function(myStoryStore) {

      this.myGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myStoryStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'Severity', 'Iteration'
        ]
      });

      this.add(this.myGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

      console.log('what is this?', this);

    }

});
