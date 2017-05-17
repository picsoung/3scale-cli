var methods = require("../lib/methods");
var metrics = require("../lib/metrics");

module.exports = function methodsRulesCommand(program) {
  program
    .command("methods <cmd>")
    .description("\n  create - Create a new method \n  list - List all methods of a service \n  show - Show a specific method of a service \n update - update a specific method of a service \n  delete - Delete a method of a service")
    .option("-s, --service <service_id>","Specify service id")
    .option("-m, --metric <metric_id>","Metric id")
    .option("-t, --methodID <method_id>", "Method ID")
    .option("-d, --method <method_name>","Method Name")
    .option("-u, --unit <name>", "unit name")
    .action(function(command,options){
      program.isConfigured()
      program.require(options.service,"Service ID");

      switch (command) {
          case "create":
            program.require(options.method,"Method name required");
            //Find id of metrics hits
            metrics.getHitsMetric(options.service)
            .then(function(hit_metric){
              methods.createMethod(options.service, hit_metric.id, options.method, options.unit).then(function(result){
                var msg = "Method with name "+options.method.inverse+" on service "+options.service.inverse+" created under "+"Hits".inverse+" metric."
                program.print({message:msg, type:"success"});
              });
            })

            break;
          case "list":
          metrics.getHitsMetric(options.service)
          .then(function(hit_metric){
              methods.listMethods(options.service, hit_metric.id).then(function(result){
                var msg = "There are "+result.length+" methods for this service.\n"
                program.print({message:msg, type:"success", table: result, key:"method"});
              });
            })
            break;
          case "show":
            program.require(options.methodID,"Method ID required");
            metrics.getHitsMetric(options.service)
              .then(function(hit_metric){
              methods.getMethodById(options.service,hit_metric.id,options.methodID).then(function(result){
                var msg = "Details about method.\n"
                program.print({message:msg, type:"success", table: result});
              });
            })
            break;
          case "update":
            program.require(options.methodID,"Method ID required");
            metrics.getHitsMetric(options.service)
              .then(function(hit_metric){
                methods.updateMethod(options.service,options.metric,options.methodID,options.method,options.unit).then(function(result){
                    var msg = "Method with id "+options.methodID.inverse+" updated.\n"
                    program.print({message:msg, type:"success", table: result});
                });
              })
            break;
          case "delete":
            program.require(options.metric,"Metric ID required");
            program.require(options.methodID,"Method ID required");

            methods.deleteMethod(options.service,options.metric,options.methodID).then(function(result){
              if(result){
                var msg = "Method id "+options.methodID.inverse+" has been deleted."
                program.print({message:msg, type:"success"});
              }
            });
            break;
          default:
            program.error({message:"Unknown command \""+command+"\""});
            process.exit(1)
      } //end switch
    }); //end action
}
