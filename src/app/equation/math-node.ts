import { v4 as uuidv4 } from 'uuid';
import * as nerdamer from 'nerdamer';

export class MathNode {
    uuid: string;
    sign: string;
    value: any;
    root: boolean;
    selected: boolean;

    constructor(sign: string = '', value: any = '', root: boolean = false) {
        this.uuid = uuidv4();
        this.sign = sign;
        this.value = value;
        this.root = root;
        this.selected = false;
        if (typeof (this.value) === 'string') {
            this.value = this.correctFormat();
            if (this.value.match(/[-+*/()]/) !== null) {
                if (this.value.startsWith('-') && this.value.substring(1).match(/[-+*/]/) === null) {
                    if (this.sign === '') {
                        this.sign = '-';
                        this.value = this.value.substring(1);
                    } else {
                        this.value = [new MathNode('-', this.value.substring(1))]
                    }

                } else {
                    this.corectMathNode();
                }
            }
            if (this.sign === '') {
                this.sign = '+';
            }
        }
    }

    correctFormat() {
        let newValue: string = this.value.split(' ').join('');
        let regexCombinations = [
            /([0-9][a-z])/i,
            /([0-9]\()/i,
            /([a-z][0-9])/i,
            /(\)[0-9])/i,
            /(\)\()/i,

        ]
        for (let i = 0; i < regexCombinations.length; i++) {
            let toReplace = newValue.match(regexCombinations[i]);
            if (toReplace !== null) {
                for (let j = 0; j < toReplace.length; j++) {
                    let replacement = toReplace[j].charAt(0) + '*' + toReplace[j].charAt(1);
                    newValue = newValue.replace(toReplace[j], replacement);
                }
            }
        }

        return newValue;
    }

    corectMathNode() {
        let valAsString: string = this.value;
        let brackets: number = 0;
        let addition: boolean = false;
        let multiplication: boolean = false;
        let division: boolean = false;


        if (valAsString.match(/[()]/g) !== null && valAsString.startsWith('(') && valAsString.endsWith(')')) {
            if (valAsString.match(/[()]/g).length === 2) {
                valAsString = valAsString.substr(1, valAsString.length - 2);
                console.log(this.uuid);
                
                console.log(valAsString);
                
            }
        }

        for (let i = 0; i < valAsString.length; i++) {
            if (valAsString[i] === '(') {
                brackets++;
            }
            if (valAsString[i] === ')') {
                brackets--;
            }

            if (brackets === 0) {
                if (valAsString[i] === '+' || valAsString[i] === '-') {
                    addition = true;
                }
                if (valAsString[i] === '*') {
                    multiplication = true;
                }
                if (valAsString[i] === '/') {
                    division = true;
                }
            }
        }

        if (addition) {
            this.value = this.parse(0);
        } else if (multiplication) {
            if (this.root) {
                this.value = [new MathNode('+', valAsString)];
            } else {
                this.value = this.parse(1);
            }
        } else if (division) {
            this.value = this.parse(2);
            
            if (this.root === true) {
                let newValue = this.getCopy();
                newValue.root = false;
                newValue.sign = '+';
                
                this.value = [newValue];
            }
        } else {
            if (valAsString.match(/[()]/g) !== null) {
                this.value = (new MathNode('', valAsString.substr(1, valAsString.length - 2))).value;
            }else{
                this.value = (new MathNode('', valAsString)).value;
            }
            
        }
    }

    //0 = addition/subtraction, 1 = multiplication, 2 = division
    parse(operation: number) {
        let valAsString: string = this.value;
        let newValue = [];
        let substring: string = '';
        let brackets: number = 0;
        if (valAsString.match(/[()]/g) !== null && valAsString.startsWith('(') && valAsString.endsWith(')')) {
            if (valAsString.match(/[()]/g).length === 2) {
                valAsString = valAsString.substr(1, valAsString.length - 2);
            }
        }

        for (let i = 0; i < valAsString.length; i++) {
            if (valAsString[i] === '(') {
                brackets++;
            } else if (valAsString[i] === ')') {
                brackets--;
            }
            if (this.checkSign(operation, valAsString[i]) && brackets === 0 && substring.length !== 0 && this.valNotNull(substring)) {
                newValue.push(new MathNode(this.extractSign(operation, substring), this.withoutSign(substring)));
                substring = '';
            }
            substring += valAsString[i];
        }
        newValue.push(new MathNode(this.extractSign(operation, substring), this.withoutSign(substring)));

        return newValue;
    }

    checkSign(operation: number, sign: string) {
        switch (operation) {
            case 0:
                return sign.match(/[+-]/g) !== null;
            case 1:
                return sign.match(/[*]/g) !== null;
            case 2:
                return sign.match(/[/]/g) !== null;
        }
    }

    extractSign(operation: number, string: string): string {
        if (string.match(/^[+-/*]/) !== null) {
            return string.substr(0, 1);
        }
        switch (operation) {
            case 0:
                return '+';
            case 1:
                return '*';
            case 2:
                return '/';
        }
    }

    withoutSign(string: string): string {
        if (string.match(/^[+-/*]/g) !== null) {
            return string.substr(1);
        }
        return string;
    }

    valNotNull(string: string): boolean {
        return this.withoutSign(string) !== '0';
    }

    find(searchedUUID: string, remove: boolean = false, replacement?: MathNode) {
        for (let i = 0; i < this.value.length; i++) {
            if (searchedUUID === this.value[i].uuid) {

                if (replacement !== undefined) {
                    if (replacement.value[0].sign !== '*') {

                        this.value[i].sign = replacement.sign;
                        this.value.splice(i, 1);
                        if (typeof (replacement.value) === 'object') {
                            for (let j = 0; j < replacement.value.length; j++) {
                                this.value.splice(i + j, 0, replacement.value[j]);
                            }
                        } else {
                            this.value.splice(i, 0, replacement);
                        }
                    } else {
                        replacement.sign = '*';
                        this.value.splice(i, 1, replacement);
                    }
                } else {
                    this.value.splice(i, remove ? 1 : 0);
                }


                return true;
            }
        }
        if (!Array.isArray(this.value)) {
            this.value.forEach(element => {
                if (element.find(searchedUUID, remove, replacement)) {
                    return true;
                }
            });
        }

        return false;
    }

    replace(searchedMathNode: MathNode, replacement: MathNode) {
        searchedMathNode.value = replacement.value;
    }

    correctStructure() {        
        

        if (!Array.isArray(this.value) && this.root) {
            this.value = [this.value];
        }

        if (Array.isArray(this.value) && this.value.length === 1 && this.value[0].sign === '+' && Array.isArray(this.value[0].value) && this.value[0].value[0].sign !== '/') {
            this.value = this.value[0].value;
        }

        

        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {

                if (Array.isArray(this.value[i].value) && this.value[i].value[0].sign === '*') {
                    for (let j = 0; j < this.value[i].value.length; j++) {
                        if (this.value[i].value[j].value === '1') {
                            this.value[i].value.splice(j, 1);
                        }
                    }
                }


                if (Array.isArray(this.value[i].value) && this.value[i].value.length === 1 && this.value[i].value[0].sign === '*') {
                    this.value[i].value = this.value[i].value[0].value;
                }                
                

                if (this.value[i].root) {
                    let arrVal = this.value[i].value;
                    if (typeof (this.value[i].value) === 'string') {

                        arrVal = [new MathNode('', this.value[i].value)];
                    } else {
                        if (this.sameOperation(this.value[i].sign, this.value[i].value[0].sign)) {
                            for (let j = 0; j < arrVal.length; j++) {
                                this.value.splice(i + j, j === 0 ? 1 : 0, arrVal[j]);
                                //this.value[i + j].root = false;
                            }
                        }
                    }
                }

                this.value[i].root = false;

                if (this.value[i].value === '0') {
                    this.value.splice(i, 1);
                }
            }



            this.value.forEach((element: MathNode) => {
                if (Array.isArray(element.value)) {
                    element.correctStructure();
                }
            });

            if (this.value.length === 0 && this.root) {
                this.value.push(new MathNode('+', '0', false));
            }
        }        
    }

    sameOperation(firstSign: string, secondSign: string): boolean {
        if ((firstSign === '-' || firstSign === '+') && (secondSign === '-' || secondSign === '+')) {
            return true;
        }
        if ((firstSign === '-' || firstSign === '/') && (secondSign === '*' || secondSign === '/')) {
            return true;
        }
        return false
    }

    multiply(expression: MathNode) {
        this.value.forEach(element => {
            if (Array.isArray(element.value)) {

                if (element.value[0].sign === '/') {                    
                    this.multiplyDivision(element, expression.getCopy());
                } else {
                    if (expression.value === '1') {
                        if (expression.sign === '-') {
                            element.changeSign();
                        }
                    } else {
                        element.value.push(new MathNode('*', expression.toString()));
                    }
                }


            } else if (element.value !== '0') {
                if (expression.value === '1') {
                    if (expression.sign === '-') {
                        element.changeSign();
                    }
                } else {
                    let prevVal = new MathNode('*', element.value)
                    element.value = [prevVal, new MathNode('*', expression.toString())];
                }
            }
        });
        //this.removeUnnecessaryBrackets();
        this.correctStructure();
    }

    multiplyDivision(mathNode: MathNode, expression: MathNode) {
        if (Array.isArray(mathNode.value[1].value)) {
            for (let i = 0; i < mathNode.value[1].value.length; i++) {
                if (this.areExpEqual(mathNode.value[1].value[i], expression)) {
                    mathNode.value[1].value.splice(i, 1);
                    return;
                }
                if (this.areAbsExpEqual(mathNode.value[1].value[i], expression)) {
                    mathNode.value[1].value.splice(i, 1);
                    mathNode.changeSign();
                    return;
                }
            }
        }

        
        if (this.areExpEqual(mathNode.value[1].toString(), expression.toString())) {
            /**
             * Expression equils donominator and cancel each other out
             */
            
            
            
            
            mathNode.value = mathNode.value[0].value;
            
        } else if (this.areAbsExpEqual(mathNode.value[1].toString(), expression.toString())) {
            mathNode.value = mathNode.value[0].value;
            mathNode.changeSign();
        } else {
            if (Array.isArray(mathNode.value[0].value)) {
                /**
                 * Numerator is array
                 */
                if (mathNode.value[0].value[0].sign === '*') {
                    /**
                     * Last executed operation in numerator would be multiplication
                     */

                    mathNode.value[0].value[0].sign = '*';
                    mathNode.value[0].value.splice(0, 0, expression);

                } else if (mathNode.value[0].value[0].sign === '/') {
                    /**
                     * Last executed operation in numerator would be division
                     */

                    let prevVal = new MathNode('*', mathNode.value[0].value);
                    mathNode.value[0].value = [expression, prevVal];
                } else {
                    /**
                     * Last executed operation in numerator would be addition or substraction
                     */

                    let prevVal = new MathNode('*', mathNode.value[0].value);
                    mathNode.value[0].value = [expression, prevVal];
                }
            } else {
                let prevVal = new MathNode('*', mathNode.value[0].value);
                mathNode.value[0].value = [expression, prevVal];
            }
        }

    }

    removeUnnecessaryBrackets() {
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                if (this.value[i].sign === '+' && (this.value[i].value[0].sign === '+' || this.value[i].value[0].sign === '-')) {
                    let bracketValue = this.value[i];
                    this.value.splice(i, 1);
                    for (let j = 0; j < bracketValue.length; j++) {
                        this.value.splice(i + j, 0, bracketValue[j]);
                    }
                }

            }
            for (let i = 0; i < this.value.length; i++) {
                this.value[i].removeUnnecessaryBrackets();
            }
        }

    }

    divide(expression: MathNode) {

        this.value.forEach(element => {
            if (Array.isArray(element.value)) {

                if (element.value[0].sign === '*') {
                    this.divideMultiplication(element, expression.getCopy());

                } else if (element.value[0].sign === '/') {
                    this.divideDivision(element, expression.getCopy());
                }

            } else if (element.value !== '0') {
                if (this.areExpEqual(element, expression)) {
                    element.sign = '+';
                    element.value = '1';

                } else if (this.areAbsExpEqual(element, expression)) {
                    element.changeSign();
                    element.value = '1';
                } else {
                    let tempExp = expression.getCopy();
                    if (expression.sign === '-') {
                        element.changeSign();
                        tempExp.changeSign();
                    }
                    if (expression.value !== '1') {
                        element.value = [new MathNode('/', element.value), new MathNode('/', tempExp.toString())];
                    }
                }
            }
        });
        this.correctStructure();
    }

    divideMultiplication(mathNode: MathNode, expression: MathNode) {
        for (let i = 0; i < mathNode.value.length; i++) {

            if (this.areExpEqual(mathNode.value[i], expression)) {
                mathNode.value.splice(i, 1);
                return;
            }

            if (this.areAbsExpEqual(mathNode.value[i], expression)) {
                mathNode.changeSign();
                mathNode.value.splice(i, 1);
                return;
            }
        }
        let tempExp = expression.getCopy();
        if (expression.sign === '-') {
            mathNode.changeSign();
            tempExp.changeSign();
        }
        if (expression.value !== '1') {
            mathNode.value = [new MathNode('/', mathNode.value), new MathNode('/', tempExp.toString())];
        }

    }

    divideDivision(mathNode: MathNode, expression: MathNode) {

        if (this.areExpEqual(mathNode.value[0], expression)) {
            /**
             * Expression equils nominator and cancel each other out
             */
            mathNode.value[0].value = '1';
        } else {
            if (Array.isArray(mathNode.value[0].value)) {
                /**
                 * Numerator is array
                 */
                if (mathNode.value[0].value[0].sign === '*') {
                    /**
                     * Last executed operation in numerator would be multiplication
                     */
                    for (let i = 0; i < mathNode.value[0].value.length; i++) {
                        if (this.areExpEqual(mathNode.value[0].value[i], expression)) {
                            mathNode.value[0].value.splice(i, 1);
                            return;

                        }
                    }

                }
                /**
                 * 
                 */
            }
            if (Array.isArray(mathNode.value[1].value)) {
                if (mathNode.value[1].value[0].sign === '*') {
                    //expression.sign = '*';
                    mathNode.value[1].value.push(new MathNode('*', expression.toString()));
                } else if (mathNode.value[1].value[0].sign === '/') {

                } else if (mathNode.value[1].value[0].sign === '+' || mathNode.value[1].value[0].sign === '-') {

                    let prevVal = new MathNode('*', mathNode.value[1].value);
                    mathNode.value[1].value = [prevVal, new MathNode('/', expression.toString())];
                }
            } else {

                let prevVal = new MathNode('*', mathNode.value[1].value);
                //expression.sign = '*';
                mathNode.value[1].value = [prevVal, new MathNode('*', expression.toString())];
            }

        }
    }

    changeSign() {
        if (this.sign === '+') {
            this.sign = '-';
        } else if (this.sign === '-') {
            this.sign = '+';
        }
    }

    /**
     * return true if searchedUUID is child of this object
     * @param searchedUUID 
     */
    isChildOf(searchedMathNode: MathNode) {
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                if (searchedMathNode.uuid === this.value[i].uuid) {
                    return true;
                };
            }
        }
        return false;
    }

    findParent(searchedMathNode: MathNode) {
        let valArray = this.getValueAsArray();
        for (let i = 0; i < valArray.length; i++) {

            if (valArray[i].uuid === searchedMathNode.uuid) {
                //console.log(this);
                return this;
            }
        }
        for (let i = 0; i < valArray.length; i++) {
            if (valArray[i].findParent(searchedMathNode) !== undefined) {
                return valArray[i].findParent(searchedMathNode);
            }
        }
    }

    areChildrenSibilings(firstMathNode: MathNode, secondMathNode: MathNode) {
        if (this.isChildOf(firstMathNode) && this.isChildOf(secondMathNode)) {
            return true;
        } else {
            let valArray = this.getValueAsArray();
            for (let i = 0; i < valArray.length; i++) {
                if (valArray[i].areChildrenSibilings(firstMathNode, secondMathNode)) {
                    return true;
                }
            }
        }
        return false;
    }

    getValueAsArray(): Array<MathNode> {
        if (Array.isArray(this.value)) {
            return this.value;
        } else {
            if (typeof (this.value) === 'object') {
                return [this.value];
            } else {
                return [];
            }

        }
    }

    getCopy(): MathNode {
        return new MathNode(this.sign, this.value, this.root);
    }

    setSelected(newValue: boolean = false) {
        this.selected = newValue;
        this.getValueAsArray().forEach(element => {
            element.setSelected(newValue);
        });
    }

    isValid(): boolean{
        if(typeof(this.value) === 'string' && (this.value === '' || this.value.match(/([^a-zA-Z0-9])/))){
            console.log('Empty value; UUID: ' +  this.uuid);
            return false;
        }
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                if(!this.value[i].isValid()){
                    return false;
                }
                
            }
        }

        return true;
    }

    toString(first: boolean = true) {
        let string = '';
        if (Array.isArray(this.value)) {
            if (!first || this.sign !== '+' && this.sign !== '*' && this.sign !== '/') {
                string += this.sign;
            }
            if (this.value[0].sign !== '*' && !this.root) {
                string += '(';
            }

            for (let i = 0; i < this.value.length; i++) {
                string += this.value[i].toString(i === 0);
            }
            if (this.value[0].sign !== '*' && !this.root) {
                string += ')';
            }
        } else {
            if (!first || this.sign !== '+' && this.sign !== '*' && this.sign !== '/') {
                string += this.sign;
            }
            string += this.value;
        }

        return string;
    }

    /**
   * Returns true if both expressions are equal.
   * If not returns false.
   * @param exp1 first expression
   * @param exp2 second expression
   */

    areExpEqual(exp1, exp2): boolean {
        let e1 = nerdamer(exp1.toString(), undefined, "expand");
        let e2 = nerdamer(exp2.toString(), undefined, "expand");
        let diff: string = `${e1.text()} - (${e2.text()})`;

        return nerdamer(diff).text() === '0';
    }

    areAbsExpEqual(exp1, exp2) {
        let e1 = nerdamer(exp1.toString(), undefined, "expand");
        let e2 = nerdamer(exp2.toString(), undefined, "expand");
        let diff: string = `abs(${e1.text()}) - abs(${e2.text()})`;

        return nerdamer(diff).text() === '0';
    }

    toString2() {
        return 'sign: ' + this.sign + '; value: ' + this.value + '; root: ' + this.root;
    }
}
