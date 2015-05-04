# classes in korbutJS

## introduction

`korbut.class` is an utilitarian function that helps developers to create and manage objects in javascript in the fashion of classes, offering support for class-like features found in other languages, while still being javascript prototypal inheritance centric.

## what you get

- inheritance ( and multiple inheritance )
- polymorphism
- encapsulation

## creating a class
- class{} korbut.class( prototype{} )
- class{} korbut.class( extended_class(, extended_class, ...), prototype{} )
- class{} korbut.class( encapsulation fn() )
- class{} korbut.class( extended_class(, extended_class, ...), encapsulation fn(statics) )

### extended_class
The extended_class is the parent (or "super") class/object from wich the new class/object will inherit.

- `extended_class` may be any object with a defined prototype
- you can list as many classes as you want ; they are implemented on the new class from left to right ( ie, properties coming from the class/object at the right will overwrite the properties coming from the class/object at the left )

### prototype{}
The prototype object is an object describing the properties of new class/object prototype. Among them is the constructor function.

- ES3 and ES5 syntaxes are accepted for each property ( ie, one can be an ES3 key, and another one can be an ES5 descriptor object )
- The constructor function is not mandatory

```javascript
var A = korbut.class({
    constructor: function(){
        this.foo = "bar"
    }
  , bar: function(){
        return this.foo
    }
  , BAR: { enumerable: true,
        return this.foo.toUpperCase()
    }
})
```

### encapsulation fn(statics)
The encapsulation function provides a private closure and a way to set statics properties. The encapsulation function must return a prototype{} object.

```javascript
var A = korbut.class(function(statics){
    var foo = "bar"

    Oject.defineProperties(statics, {
        FOO: { enumerable: true,
            get: function(){
                return foo.toUpperCase()
            }
        }
    })

    return {
        foo: { enumerable: true,
            get: function(){ return foo }
        }
    }
})

new A().foo // "bar"
A.FOO // "BAR"
```

### class/object
`korbut.class` always return a class, or speaking in javascript, an object with a prototype and a constructor.
All classes returned by `korbut.class` are augmented with a few static methods that will provide useful features and/or shortcuts.

#### boolean class.isImplementedBy()
`class.isImplementedBy()` provides a way to assess that an object is *compatible* with the class. To be compatible, the tested object must either be the class itself, an inhereting class, an instance of the class, an instance of an inheriting class, or anything that implements the same *interface* as the class. An Object which has been modified with an incompatible element of the interface will not be compatible.

This method is the key to polymorphism, and a good comprehension of the mechanism of `korbut.class` prototype declaration will be helpful to predict the response of `class.isImplementedBy()` :

- properties declared with the ES3 syntax are considered written as with the ES5 descriptor `{ enumerable: true, configurable: true, writable: true }`.
- `{ configurable: true }` properties can be overwritten by an inheriting class
- `{ configurable: false }` *cannot* be overwritten, and trying to do so will throw an error
- in any case an object can overwrite a `{ configurable: true }` property if the overwritten property is defined on the object itself instead of its prototype
- when using `class.isImplementedBy()`, a `{ configurable: true }` requires that the tested object has the *exact same* property in its prototype
- when using `class.isImplementedBy()`, a `{ configurable: false }` requires that the tested object has a property of the same type in its prototype

```javascript
var A = korbut.class({
    foo: { enumerable: true,
        value: function(){}
    }
})

// this will THROW an error
try {
var B = korbut.class(A, {
    foo: function(){}
}) // throw typeError
} catch(e){
    console.error(e)
}
// this is ok
var B = korbut.class(A, {
    constructor: function(){
        this.foo = function(){
            return A.prototype.foo.apply(this, arguments)
        }
    }
  , bar: { enumerable: true, configurable: true,
        value: function(){}
    }
})

var C = korbut.class(A, {
    bar: function(){}
})

// try to guess what return values you would get for those test :
console.log(
A.isImplementedBy(B),
A.isImplementedBy(C),
B.isImplementedBy( new C ),
A.isImplementedBy( { foo: A.prototype.foo } ),
A.isImplementedBy( { prototype: { foo: A.prototype.foo } } )
)

/* ...





true, true, true, false, true
*/

```
