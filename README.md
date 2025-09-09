

1 ans: 
  var
	It is function-scoped.
	It allows redeclaration.•	It is hoisted and initialized with undefined.
	It is older (used before ES6).
  let
	It is block-scoped.
	It does not allow redeclaration in the same scope.
	It is hoisted but not initialized (exists in the Temporal Dead Zone until defined).
	Introduced in ES6.
  const
	It is also block-scoped.
	It must be initialized at the time of declaration.
	The value cannot be reassigned, but for objects/arrays, properties or elements can be changed.
	Introduced in ES6.


2 ans: 
  map() ---Returns a new array after transforming each element.
  forEach() --- Executes a function for each element, returns nothing.
  filter() ----- Returns a new array with elements that pass a condition.


3 ans:
  No need to use the function keyword.
  Provides cleaner and shorter code.
  Does not have its own this, it uses the surrounding this.


4 ans:
Destructuring assignment in ES6 allows extracting values from arrays or objects into separate variables.
	Array ---  values are taken by position.
	Object --- values are taken by property name.


5 ans:
Template literals in ES6 are a new way to create strings using backticks (`).
	Variables/expressions can be embedded with ${ }.
	Supports multi-line strings.
Difference from concatenation:
	No need for + operator.
	Easier to read and write compared to traditional concatenation.


