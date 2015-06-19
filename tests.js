/* global calculate_change, create_solver_object, add_equilibrium */
/* global run_next_equilibrium */
/* global solve_chemical_equilibrium */
/* global test, deepEqual, equal, ok */
/* global deeply_unique, combine_head_and_tails, get_total_distance, get_ratio_of_combo */
/* jshint globalstrict:true */

"use strict";

// tests like deepEqual are deepEqual(actual,expected,message)
//

test("calculate_change", function() {
  close.percent(calculate_change(1.6E-5, 13.8E-3, 72.4E-3, 1E-7), 2.9E-6, 2, "positive change properly calculated");
});

test("test_create_solver_object", function() {
  var equilibrium_array = [];
  add_equilibrium(equilibrium_array, 6.2E-10, "HCN", "H+", "CN-");
  add_equilibrium(equilibrium_array, 1.6E-5, "CN-", "HCN", "OH-");
  add_equilibrium(equilibrium_array, 1E-14, null, "H+", "OH-");

  var concentrations = {};
  concentrations["HCN"] = 72.4E-3;
  concentrations["CN-"] = 13.8E-3;
  concentrations["H+"] = 1E-7;
  concentrations["OH-"] = 1E-7;

  var solver = create_solver_object(equilibrium_array, concentrations);
  //
  //
  var expected_solver = {
    "biggest_percentage_change": [
      Infinity,
      Infinity,
      Infinity
    ],
    "concentration_array": {
      "HCN": 72.4E-3,
      "CN-": 13.8E-3,
      "H+": 1E-7,
      "OH-": 1E-7
    },
    "equilibrium_array": [{
      "K": 6.2e-10,
      "first_product": "H+",
      "reactant": "HCN",
      "second_product": "CN-"
    }, {
      "K": 0.000016,
      "first_product": "HCN",
      "reactant": "CN-",
      "second_product": "OH-"
    }, {
      "K": 1e-14,
      "first_product": "H+",
      "reactant": null,
      "second_product": "OH-"
    }],
    "equilibrium_to_run": 0
  };
  deepEqual(solver, expected_solver, "solver object looks good!");
});

test("test_run_next_equilibrium", function() {
  var equilibrium_array = [];
  add_equilibrium(equilibrium_array, 6.2E-10, "HCN", "H+", "CN-");
  add_equilibrium(equilibrium_array, 1.6E-5, "CN-", "HCN", "OH-");
  add_equilibrium(equilibrium_array, 1E-14, null, "H+", "OH-");

  var concentrations = {};
  concentrations["HCN"] = 72.4E-3;
  concentrations["CN-"] = 13.8E-3;
  concentrations["H+"] = 1E-7;
  concentrations["OH-"] = 1E-7;

  var solver = create_solver_object(equilibrium_array, concentrations);
  run_next_equilibrium(solver);
  equal(solver.equilibrium_to_run, 1, "equilibrium_to_run updated");
  close(solver.biggest_percentage_change[0], 29.7429, 0.1);
  close(solver.concentration_array["H+"], 3.25278e-9, 0.1);
  run_next_equilibrium(solver);
  close(solver.concentration_array["OH-"], 3E-6, 0.1);
});

test("test_solve_chemical_equilibrium", function() {
  var equilibrium_array = [];
  add_equilibrium(equilibrium_array, 5.6E-10, "C2H3O2-", "HC2H3O2", "OH-");
  add_equilibrium(equilibrium_array, 1E-14, null, "H+", "OH-");

  var concentrations = {};
  concentrations["C2H3O2-"] = 40E-3;
  concentrations["HC2H3O2"] = 0;
  concentrations["H+"] = 1E-7;
  concentrations["OH-"] = 1E-7;

  var solver = create_solver_object(equilibrium_array, concentrations);
  solve_chemical_equilibrium(solver, 0.000001);
  close.percent(solver.concentration_array["C2H3O2-"], 4E-2, 1);
  close.percent(solver.concentration_array["H+"], 2.1E-9, 1);
  close.percent(solver.concentration_array["OH-"], 4.7E-6, 1);
  close.percent(solver.concentration_array["HC2H3O2"], 4.7E-6, 1);
});
