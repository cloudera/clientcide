/*
---

script: Fx.Marquee.js

description: Defines Fx.Marquee, a marquee class for animated notifications.

License: MIT-Style License

requires:
- Core/Fx.Morph
- More/Element.Shortcuts

provides:
- Fx.Marquee

...
*/
Fx.Marquee = new Class({
	Extends: Fx.Morph,
	options: {
		mode: 'horizontal', //or vertical
		message: '', //the message to display
		revert: true, //revert back to the previous message after a specified time
		delay: 5000, //how long to wait before reverting
		cssClass: 'msg', //the css class to apply to that message
		showEffect: { opacity: 1 },
		hideEffect: {opacity: 0},
		revertEffect: { opacity: [0,1] },
		currentMessage: null
/*	onRevert: $empty,
		onMessage: $empty */
	},
	initialize: function(container, options){
		container = document.id(container); 
		var msg = this.options.currentMessage || (container.getChildren().length == 1)?container.getFirst():''; 
		var wrapper = new Element('div', {	
				styles: { position: 'relative' },
				'class':'fxMarqueeWrapper'
			}).inject(container); 
		this.parent(wrapper, options);
		this.current = this.wrapMessage(msg);
	},
	wrapMessage: function(msg){
		var wrapper;
		if (document.id(msg) && document.id(msg).hasClass('fxMarquee')) { //already set up
			wrapper = document.id(msg);
		} else {
			//create the wrapper
			wrapper = new Element('span', {
				'class':'fxMarquee',
				styles: {
					position: 'relative'
				}
			});
			if (document.id(msg)) wrapper.grab(document.id(msg)); //if the message is a dom element, inject it inside the wrapper
			else if ($type(msg) == "string") wrapper.set('html', msg); //else set it's value as the inner html
		}
		return wrapper.inject(this.element); //insert it into the container
	},
	announce: function(options) {
		this.setOptions(options).showMessage();
		return this;
	},
	showMessage: function(reverting){
		//delay the fuction if we're reverting
		(function(){
			//store a copy of the current chained functions
			var chain = this.$chain?$A(this.$chain):[];
			//clear teh chain
			this.clearChain();
			this.element = document.id(this.element);
			this.current = document.id(this.current);
			this.message = document.id(this.message);
			//execute the hide effect
			this.start(this.options.hideEffect).chain(function(){
				//if we're reverting, hide the message and show the original
				if (reverting) {
					this.message.hide();
					if (this.current) this.current.show();
				} else {
					//else we're showing; remove the current message
					if (this.message) this.message.dispose();
					//create a new one with the message supplied
					this.message = this.wrapMessage(this.options.message);
					//hide the current message
					if (this.current) this.current.hide();
				}
				//if we're reverting, execute the revert effect, else the show effect
				this.start((reverting)?this.options.revertEffect:this.options.showEffect).chain(function(){
					//merge the chains we set aside back into this.$chain
					if (this.$chain) this.$chain.combine(chain);
					else this.$chain = chain;
					this.fireEvent((reverting)?'onRevert':'onMessage');
					//then, if we're reverting, show the original message
					if (!reverting && this.options.revert) this.showMessage(true);
					//if we're done, call the chain stack
					else this.callChain.delay(this.options.delay, this);
				}.bind(this));
			}.bind(this));
		}).delay((reverting)?this.options.delay:10, this);
		return this;
	}
});