var Crawler = require("crawler").Crawler;

var c = new Crawler({
	"maxConnections":10,

    // This will be called for each crawled page
    "callback":function(error,result,$) {
    	var location = "";
    	$(".locationBar a").each(function(index,a){
    		var val = $(a).text();
    		val = val.split('\t').join('');
    		val = val.replace('\n',' ');
    		location += " "+val;
    	});

        // $ is a jQuery instance scoped to the server-side DOM of the page
        $(".region-nav-item a").each(function(index,a) {
        	c.queue(a.href);
        });

        var regex = /http:\/\/www.cne.gob.ve\/resultado_presidencial_2013\/r\/1\/reg_(\d+).html/;
        var match = regex.exec(this.uri);
        var id_entity = match[1];
        // console.log(match[1]);
        var entity = {}
        	entity.id = id_entity;
        	entity.location = location;
        	entity.candidates = [];
        $(".tbsubtotalrow").each(function(index,tr){
        	var candidate = {};

        	$(tr).find("td > span").each(function(index,span){
        		
        		var val = $(span).text();
        		if(val.match(/^\d+,\d+%$/g)) {
        			candidate.percent = val;
        		} else if (val.match(/^\d+(\.\d{3})*$/g)) {
        			candidate.votes = val;
        		}
        		
        	});

        	$(tr).find("td > a").each(function(index,a){
        		var name = $(a).text();
        		candidate.name = name;
        	});

			entity.candidates.push(candidate);

        });
        console.log(entity);
    }
});

c.queue("http://www.cne.gob.ve/resultado_presidencial_2013/r/1/reg_000000.html");

var tmp = function(uno) {
	console.log(uno);
}