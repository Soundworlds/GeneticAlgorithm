		inlets = 1;
		outlets = 2;
		
		var populationSize = 400;
        var crossoverProb = 0.9;
        var mutationProb = 0.2;
		var target = '';

		var gen = 0;
		var generation = [];
        var avgFitness = 0;
		var numGenerations = 70;
		
		var isDone = false;
		var allData = "";
		
        function fitness(chromosome){
            // higher fitness is better
            var f = 0; // start at 0 - the best fitness
            for(var i=0, c=target.length/2 ; i<c ; i++) {
                // subtract the ascii difference between the target character and the chromosome character. Thus 'c' is fitter than 'd' when compared to 'a'.
//                f -= Math.abs(target.charCodeAt(i)-chromosome[i]);
				f -= Math.abs(target.substr(i*2,2)-chromosome[i])
            }
            return f;
        }
        
        function chromosomeToString(chromosome) {
            // a chromosome is just an array of values. Usually binary, in our case integers between 0 and 255 - character codes.
            var str = '';
            for(var i=0, c=chromosome.length ; i<c ; i++) {
				if (chromosome[i]>9){
                	str += chromosome[i];
				}
				else{
					str += "0" + chromosome[i];
				}
            }
            return str;
        }

        function rand(min, max) {
            // Math.floor gives 'better' random numbers than Math.round, apparently.
            return Math.floor(Math.random()*(max-min+1));
        }
        
        function letThereBeLight(popSize, coverProb, mutProb, targetString) {
            
			populationSize = popSize;
         	crossoverProb = coverProb;
         	mutationProb = mutProb;
			target = targetString;

            gen = 0;
			generation = [];
        	avgFitness = 0;
			numGenerations = 70;
            
            
            // seed population:
            generation[0] = [];
            for(var i=0 ; i<populationSize ; i++) {
                // next version - make the strings of different lengths!
                generation[0][i] = [];
                for(var j=0 ; j<target.length/2 ; j++) {
                    generation[0][i].push(rand(10,100));
                }
                avgFitness += fitness(generation[0][i]);
            }
            avgFitness /= populationSize;

            for(var g=1 ; g<numGenerations ; g++) {
				nextGeneration ();
				if (isDone == true) {
					break;
				}
			}

		}
		
		function nextGeneration (){
			
			//numGenerations++;
			
			var yFactor = 3;
            var xFactor = 6;
            var outputSpace = 215;



            var bestCandidate = {"fitness":Math.max(Math.abs(avgFitness/yFactor),300)*yFactor+1};
            var worstCandidate = {"fitness":Math.max(Math.abs(avgFitness/yFactor),300)*yFactor+1};

            // start evolving:
            var bestGen = numGenerations;
            
//!!!            for(var gen=1 ; gen<numGenerations ; gen++) {
				gen++;
                // new generation starts empty:
                generation[gen] = [];
                // tournament selection:
                // take two random members of the population. Choose a random number r. If r>k, select fittest member, else select unfit member.
                // Repeat, breed. Higher k means fitter parents. Sometimes seemingly unfit parents carry important genes, so we don't just want to set k=1
                // Actually in this case k=1 makes it a lot faster. For a larger problem domain it probably wouldn't help so much...
                var r;
                var k = 1;
                var candidates = [];
                var parents = [];
                var crossoverPoint;
                // fill the new generation with as many candidates as the population size (pop remains constant from generation to generation)
                for(var i=0,c=populationSize ; i<c ; i+=2) {
                    // choose parental candidates:
                    for(var j=0 ; j<2 ; j++) {
                        // chose random member of previous generation:
                        r = rand(0,populationSize-1);
                        candidates[0] = generation[gen-1][r];
                        //do{
                        // chose random member of previous generation:
                        r = rand(0,populationSize-1);
                        candidates[1] = generation[gen-1][r];
                      
                        // run tournament to determine winning candidate:
                        r = Math.random();
                        if(fitness(candidates[0]) > fitness(candidates[1])) {
                            if(r<k) {
                                // keep fittest candidate
                                parents[j] = candidates[0];
                            } else {
                                parents[j] = candidates[1];
                            }
                        } else {
                            if(r<k) {
                                // keep fittest candidate
                                parents[j] = candidates[1];
                            } else {
                                parents[j] = candidates[0];
                            }                        
                        }
                    }
                                        
                    // produce offspring:
                    r = Math.random();
                    if(r<crossoverProb){
                        // perform crossover on parents to produce new children:
                        crossoverPoint = rand(1,parents[0].length-2); // don't allow crossover to occur at the far ends of the chromosome - that's just a straight swap and therefore simply cloning.
                        generation[gen][i] = parents[0].slice(0,crossoverPoint);
                        generation[gen][i] = generation[gen][i].concat(parents[1].slice(crossoverPoint));

                        generation[gen][i+1] = parents[1].slice(0,crossoverPoint);
                        generation[gen][i+1] = generation[gen][i+1].concat(parents[0].slice(crossoverPoint));
                    } else {
                        // attack of the clones:
                        generation[gen][i] = parents[0];
                        generation[gen][i+1] = parents[1];
                    }
                    
                    // mutate each child:
                    for(var j=0 ; j<2 ; j++) {
                        r = Math.random();
                        if(r<mutationProb){
                            // chose a point in the chromosome to mutate - can be anywhere
                            mutationPoint = rand(0,generation[gen][i+j].length-1);
                            // working on a binary gene:
                            //generation[gen][i+j][mutationPoint] = !generation[gen][i+j][mutationPoint]+0; // quick bit flip
                            // working on our 256-valued gene:
                            // rather than just replacing the character at the mutation point with rand(0,255), we instead 'move' the character up to (n) place to the left or right as it were, where n is something pretty small like 5 or 10.
                            generation[gen][i+j][mutationPoint] += rand(-5,5);
                        }
                    }
                }
                
                // now get average and best fitness and display:
                var previousAvg = avgFitness;
                var previousBest = bestCandidate.fitness;
                var previousWorst = worstCandidate.fitness
                worstCandidate.fitness =0;
                var avgFitness = f = 0;
                for(var j=0 ; j<populationSize ; j++) {
                    
                    f = fitness(generation[gen][j])
                    avgFitness += f;
                    if(f > bestCandidate.fitness || j==0) {
                        bestCandidate = {"candidate":generation[gen][j],"fitness":f};
                    } else if(f<worstCandidate.fitness) {
                        worstCandidate = {"candidate":generation[gen][j],"fitness":f};
                    }
                }
                avgFitness /= populationSize;
                

				var bestStr = chromosomeToString(bestCandidate.candidate);
				allData += bestCandidate.candidate
				
//				if(gen==1 || gen%5==0 || gen==numGenerations-1) {
                    post("Generation "+gen+" best: ["+bestStr+"]");
					post();
//                }
                if(bestCandidate.fitness==0 && bestGen+1==numGenerations) {
                    bestGen = gen;
                }
				if (bestStr == target) {
					post("Work is done!");
					post();
					isDone = true;
///					break;
				}
				
				if ((gen + 1) == numGenerations){
					outlet(0,allData);
					outlet(1,"bang");
				}
///!!!             }

       };


        