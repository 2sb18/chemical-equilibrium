/* exported calculate_change */
/* exported add_equilibrium */
/* exported create_solver_object */
/* exported run_next_equilibrium */

function check_possible_change(possible_change, reactant_concentration,
  first_product, second_product) {
  "use strict";
  if (possible_change > 0) {
    if (reactant_concentration > possible_change) {
      return true;
    } else {
      return false;
    }
  } else {
    if (first_product > -possible_change &&
      second_product > -possible_change) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

// only deals with coefficients of 1. only deals with a maximum of one reactant and
// two products
function calculate_change(K, reactant_concentration, first_concentration, second_concentration) {
  "use strict";
  if (typeof reactant_concentration === "undefined") {
    reactant_concentration = 1;
  }
  if (typeof first_concentration === "undefined" || typeof second_concentration === "undefined") {
    // this is easier to caculate
    if (typeof first_concentration !== "undefined") {
      return (K * reactant_concentration - first_concentration) / (1 + K);
    } else if (typeof second_concentration !== "undefined") {
      return (K * reactant_concentration - second_concentration) / (1 + K);
    }
    throw "calculate_change requires there to be at least one product";
  }

  var a, b, c;
  a = 1;
  if (typeof reactant_concentration === "undefined") {
    b = first_concentration + second_concentration;
    c = first_concentration * second_concentration - K;
  } else {
    b = first_concentration + second_concentration + K;
    c = first_concentration * second_concentration - K * reactant_concentration;
  }

  var discriminant = Math.pow(b, 2) - 4 * a * c;

  if (discriminant < 0) {
    throw "discriminant is less than 0";
  }

  var possible_change_1 = (-b + Math.sqrt(discriminant)) / 2;
  var possible_change_2 = (-b - Math.sqrt(discriminant)) / 2;

  var is_1_possible = check_possible_change(possible_change_1, reactant_concentration, first_concentration, second_concentration);
  var is_2_possible = check_possible_change(possible_change_2, reactant_concentration, first_concentration, second_concentration);

  if (is_1_possible && is_2_possible) {
    throw "2 solutions are possible, that's not good!";
  } else if (is_1_possible) {
    return possible_change_1;
  } else if (is_2_possible) {
    return possible_change_2;
  } else {
    throw "can't find a solution, that's not good!";
  }
}

function solve_chemical_equilibrium(solver_object, percentage_tolerance) {
  "use strict";

  function biggest_percentage() {
    var biggest = 0;
    var i;
    for (i = 0; i < solver_object.biggest_percentage_change.length; i++) {
      if (solver_object.biggest_percentage_change[i] > biggest) {
        biggest = solver_object.biggest_percentage_change[i];
      }
    }
    return biggest;
  }

  while (biggest_percentage() > percentage_tolerance) {
    run_next_equilibrium(solver_object);
  }
}


// this works on the solver_object
function run_next_equilibrium(solver_object) {
  "use strict";
  // figure out what is the next 
  var equilibrium = solver_object.equilibrium_array[solver_object.equilibrium_to_run];
  var concentrations = solver_object.concentration_array;

  var K = equilibrium.K;
  var reactant = equilibrium.reactant;
  var first_product = equilibrium.first_product;
  var second_product = equilibrium.second_product;

  var change = calculate_change(K, concentrations[reactant],
    concentrations[first_product], concentrations[second_product]);

  solver_object.biggest_percentage_change[solver_object.equilibrium_to_run] = 0;

  function update_concentration_and_biggest_percent_change(chemical, is_reactant) {
    if (chemical !== null) {
      var original_concentration = concentrations[chemical];
      var new_concentration = original_concentration + (is_reactant ? -1 : 1) * change;
      var percent_change;
      if (original_concentration > new_concentration) {
        percent_change = original_concentration / new_concentration - 1;
      } else {
        percent_change = new_concentration / original_concentration - 1;
      }
      if (percent_change > solver_object.biggest_percentage_change[solver_object.equilibrium_to_run]) {
        solver_object.biggest_percentage_change[solver_object.equilibrium_to_run] = percent_change;
      }
      concentrations[chemical] = new_concentration;
    }
  }

  update_concentration_and_biggest_percent_change(reactant, true);
  update_concentration_and_biggest_percent_change(first_product, false);
  update_concentration_and_biggest_percent_change(second_product, false);

  //update equilibrium_to_run
  solver_object.equilibrium_to_run++;
  if (solver_object.equilibrium_to_run >= solver_object.equilibrium_array.length) {
    solver_object.equilibrium_to_run = 0;
  }
}

// have an array of equilibria
// an equilibria looks like this { K: 6.2E-10, reactant: "HCN-", first_product: "H+", second_product: "CN-" }
// you don't include water, so if there's no reactant, or product, you can either include it as null or just not include it
// for ex. for water: { K: 1.0E-14, first_product: "H+", second_product: "OH-" }
//
function add_equilibrium(equilibrium_array, K, reactant, first_product, second_product) {
  "use strict";
  equilibrium_array.push({
    K: K,
    reactant: reactant,
    first_product: first_product,
    second_product: second_product
  });
}

// percentage changes are related to equilibriums, not concentrations
function create_solver_object(equilibrium_array, concentration_array) {
  "use strict";
  var biggest_percentage_change = [];
  for (var x = 0; x < equilibrium_array.length; x++) {
    biggest_percentage_change.push(Infinity);
  }
  var object_to_return = {
    equilibrium_array: equilibrium_array,
    concentration_array: concentration_array,
    equilibrium_to_run: 0,
    biggest_percentage_change: biggest_percentage_change
  };
  return object_to_return;
}
