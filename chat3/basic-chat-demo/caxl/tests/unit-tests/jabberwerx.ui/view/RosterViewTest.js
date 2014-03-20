jabberwerx.$(document).ready( function() {    
    
    var rosterView;
    
    module("jabberwerx.ui/view/RosterView", {
        setup: function() {
            rosterView = new jabberwerx.ui.RosterView(new jabberwerx.EntitySet());
        }
    });
    
    /* Utility funuctions */
    function createDummyEntity(jid) {
		var ent = { 
				entity: {getDisplayName: function(){return jid;}
			}
		};
		
		return ent;
	};
    
    /* Test functions */
    test("Test sort with expected add to the start of the array", function() {
		var items = ["B", "C", "D", "E", "F", "G"];
		var itemToAdd = "A";
		items = jabberwerx.$.map(items, function(val, idx){
			return createDummyEntity(val);
		});

		var sortIndex = rosterView._sortEntity(items,createDummyEntity(itemToAdd));
        equals(sortIndex, 0);
    });
	
    test("Test sort with expected add to the end of the array", function() {
		var items = ["B", "C", "D", "E", "F", "G"];
		var itemToAdd = "H";
		items = jabberwerx.$.map(items, function(val, idx){
			return createDummyEntity(val);
		});

		var sortIndex = rosterView._sortEntity(items,createDummyEntity(itemToAdd));
        equals(sortIndex, 6);
    });
	
    test("Test sort with expected add to the middle of the array", function() {
		var items = ["B", "C", "D", "F", "G", "H"];
		var itemToAdd = "E";
		items = jabberwerx.$.map(items, function(val, idx){
			return createDummyEntity(val);
		});

		var sortIndex = rosterView._sortEntity(items,createDummyEntity(itemToAdd));
        equals(sortIndex, 3);
    });
	
    test("Test sort with small number of duplicates", function() {
		var items = ["B", "C", "D", "D", "G", "H"];
		var itemToAdd = "D";
		items = jabberwerx.$.map(items, function(val, idx){
			return createDummyEntity(val);
		});

		var sortIndex = rosterView._sortEntity(items,createDummyEntity(itemToAdd));
        equals(sortIndex, 2);
    });
	
    test("Test sort with large number of duplicates", function() {
		var items = ["B", "C", "D", "D", "D", "D", "D", "G", "H"];
		var itemToAdd = "D";
		items = jabberwerx.$.map(items, function(val, idx){
			return createDummyEntity(val);
		});

		var sortIndex = rosterView._sortEntity(items,createDummyEntity(itemToAdd));
        equals(sortIndex, 2);
    });
	
    test("Test sort with add to an empty array", function() {
		var items = [];
		var itemToAdd = "D";
		items = jabberwerx.$.map(items, function(val, idx){
			return createDummyEntity(val);
		});

		var sortIndex = rosterView._sortEntity(items,createDummyEntity(itemToAdd));
        equals(sortIndex, 0);
    });
    
});
