var Crawler = require("crawler").Crawler;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CenterSchema = new Schema({
    id: {
        type: String
    },        
    location: {
        Pais: {
            type: String
        },
        Estado: {
            type: String
        },
        Municipio: {
            type: String
        },
        Parroquia: {
            type: String
        },
        Centro_de_votación: {
            type: String
        }
    },
    candidates: {
        type: [{
            votes: {
                type: String
            },
            percent: {
                type: String
            },
            name: {
                type: String
            }
        }]
    }
});


mongoose.model('Centro', CenterSchema);

var serverDb = mongoose.createConnection("127.0.0.1","cne_data", 27017, function(err) {
    if(err instanceof Error) {
        console.log("Ocurrio un error.");
    }
});

var Center = serverDb.model('Centro');

var c = new Crawler({
	"maxConnections":10,

    // This will be called for each crawled page
    "callback":function(error,result,$) {
    	var location = {};
    	$(".locationBar a").each(function(index,a){
    		var val = $(a).text();
    		val = val.split('\t').join('');
    		val = val.replace('\n',' ');

    		var val_array = val.split(':');
    		var key = val_array[0].trim();
    		key = key.split(' ').join('_');
    		var value = val_array[1].trim();
    		location[key] = value;
    	});

        // $ is a jQuery instance scoped to the server-side DOM of the page
        $(".region-nav-item a").each(function(index,a) {
        	c.queue(a.href);
        });

        var regex = /http:\/\/www.cne.gob.ve\/resultado_presidencial_2013\/r\/(\d)\/reg_(\d+).html/;
        var match = regex.exec(this.uri);
        var id_entity = match[1]+"-"+match[2];
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

        	$(tr).find("td a").each(function(index,a){
        		var name = $(a).text();
        		candidate.name = name;
        	});

           entity.candidates.push(candidate);

       });
        Center.findOne({id:entity.id}, function(err, exist) {
            if(err)
                console.log("Error en conseguir uno.");
            if(exist) {
                console.log("Ya existe los datos de ",entity.id);
            } else {
             var center = new Center(entity);
             center.save(function(err) {
                if (err) 
                    console.log("error saving in database");
                console.log("Se guardo con existo los datos del centro ", entity.id);
            })
         }


     })

//        console.log(entity);
    }
});

c.queue("http://www.cne.gob.ve/resultado_presidencial_2013/r/1/reg_000000.html");

