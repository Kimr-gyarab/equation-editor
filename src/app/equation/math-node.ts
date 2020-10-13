import { v4 as uuidv4 } from 'uuid';
import * as nerdamer from 'nerdamer/nerdamer.core.js';

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
            if (this.value.match(/[-+*/()]/) !== null || this.root) {
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

    /**
     * Adds '*' between multiplication in this.value string
     */
    correctFormat(): string {
        let newValue: string = this.value.split(' ').join('');
        let toReplace = newValue.match(/([a-z0-9\)][a-z\(])|([a-z\)][0-9a-z\(])/ig);
        while (toReplace !== null) {
            for (let j = 0; j < toReplace.length; j++) {
                let replacement = toReplace[j].charAt(0) + '*' + toReplace[j].charAt(1);
                newValue = newValue.replace(toReplace[j], replacement);
            }
            toReplace = newValue.match(/([a-z0-9\)][a-z\(])|([a-z\)][0-9a-z\(])/ig);
        }
        return newValue;
    }

    /**
     * Corrects this.value from string with +-/* to array of MathNodes
     */
    corectMathNode(): void {

        let valAsString: string = this.value;
        let brackets: number = 0;
        let addition: boolean = false;
        let multiplication: boolean = false;
        let division: boolean = false;


        if (valAsString.match(/[()]/g) !== null && valAsString.startsWith('(') && valAsString.endsWith(')')) {
            if (valAsString.match(/[()]/g).length === 2) {
                valAsString = valAsString.substr(1, valAsString.length - 2);
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
            } else {
                //possible problems
                this.value = [new MathNode('', valAsString)];
            }
        }
    }

    /**
     * Parses value of string to MathNode
     * @param operation 0 = addition/subtraction, 1 = multiplication, 2 = division
     */
    parse(operation: number): Array<MathNode> {
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
            if (this.checkSign(operation, valAsString[i]) && brackets === 0 && substring.length !== 0 && this.withoutSign(substring) !== '0') {
                newValue.push(new MathNode(this.extractSign(operation, substring), this.withoutSign(substring)));
                substring = '';
            }
            substring += valAsString[i];
        }
        newValue.push(new MathNode(this.extractSign(operation, substring), this.withoutSign(substring)));

        return newValue;
    }

    /**
     * Returns true when operation matches corresponding sign 
     * @param operation 0 = addition/subtraction, 1 = multiplication, 2 = division
     * @param sign string contianig sign
     */
    checkSign(operation: number, sign: string): boolean {
        switch (operation) {
            case 0:
                return sign.match(/[+-]/g) !== null;
            case 1:
                return sign.match(/[*]/g) !== null;
            case 2:
                return sign.match(/[/]/g) !== null;
        }
    }

    /**
     * Returns sign from string or sign according to operation.
     * @param operation 0 = addition/subtraction, 1 = multiplication, 2 = division
     * @param string string which can contiain sign
     */
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

    /**
     * Returns string without sign.
     * @param string to return without sign.
     */
    withoutSign(string: string): string {
        if (string.match(/^[+-/*]/g) !== null) {
            return string.substr(1);
        }
        return string;
    }

    /**
     * Corrects structure of MathNodes – removes: 0 from addition, 1 form multiplication, unnecessary nesting; corrects replaced nodes and value of root.
     * Returns whether any changes were made.
     */
    correctStructure(): boolean {        
        let anyChanges = false;
        if (this.root) {
            if (this.value.length === 0) {
                //adds 0 if there is no other node
                this.value.push(new MathNode('+', '0', false));
                return false;
            }/* else if (this.value[0].sign === '*' || this.value[0].sign === '/') {
                //removes unnecessary nesting
                
                this.value = [this.value];
            } */else if (typeof (this.value) === 'string') {
                //correct type of root value
                console.log(this.value);
                
                this.value = [this.getCopy()];
                this.value[0].root = false;
                anyChanges = true;
                console.log(this.value);
            }
        }

        //creates fraction from decimal
        if (typeof (this.value) === 'string' && this.value.match(/[^0-9.]/) === null) {
            if(this.value.indexOf('.') !== -1){
                let frac = nerdamer.convertFromLaTeX(nerdamer.convertToLaTeX(this.value).toString()).toString();
                this.value = [new MathNode('', frac)];
                anyChanges = true;
            }else{
                if (this.value.toString() !== parseInt(this.value).toString()){
                    anyChanges = true;
                }
                this.value = '' + parseInt(this.value);
            }
        }

        if (Array.isArray(this.value)) {
            if (this.value.length > 2 && this.value[0].sign === '/') {
                let numerator = new MathNode('/', this.value.slice(0, this.value.length - 1));
                let denominator = this.value[this.value.length - 1];
                this.value = [numerator, denominator];
                anyChanges = true;
            }
        }

        if (Array.isArray(this.value)) {
            if (this.value.length === 1 && this.value[0].sign !== '-' && !this.root) {
                //removes unnecessary nesting
                this.value = this.value[0].value;
                anyChanges = true;
            }
        }

        if (Array.isArray(this.value)) {
            //remove redundant 1 from multiplication
            let newValue = [];
            for (let i = 0; i < this.value.length; i++) {
                if ((this.value[i].value !== '1' && this.value[0].sign === '*') ||
                    (this.value[i].value !== '0' && this.value[0].sign !== '*')) {
                    newValue.push(this.value[i]);
                } else {
                    anyChanges = true;
                }
            }

            if (newValue.length === 0 && this.value[0].sign === '*') {
                this.value = '1';
            } else if (newValue.length === 0 && this.root) {
                this.value = [new MathNode('+', '0')];
                return false;
            } else {
                this.value = newValue;
            }
        }

        if (Array.isArray(this.value)) {
            //corrects replaced nodes
            for (let i = 0; i < this.value.length; i++) {
                if (this.value[i].selected) {
                    let arrVal = this.value[i].value;
                    if (typeof (this.value[i].value) === 'string') {

                        arrVal = [new MathNode('', this.value[i].value)];
                    } else {
                        if (this.sameOperation(this.value[i].sign, this.value[i].value[0].sign)) {
                            for (let j = 0; j < arrVal.length; j++) {
                                this.value.splice(i + j, j === 0 ? 1 : 0, arrVal[j]);
                            }
                        }
                    }
                    this.value[i].selected = false;
                    anyChanges = true;
                }
            }
        }
        //recursively calls this function
        this.getValueAsArray().forEach((element: MathNode) => {
            anyChanges = element.correctStructure() ? true : anyChanges;
        });

        return anyChanges;
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

    /**
     * Multiplies MathNode by expression. Called only in root MathNode
     * @param expression to multiply with
     */
    multiply(expression: MathNode) {
        this.value.forEach(element => {
            if (Array.isArray(element.value)) {

                if (element.value[0].sign === '/') {
                    this.multiplyDivision(element, expression.getCopy());
                } else if (element.value[0].sign === '*') {
                    element.value.push(new MathNode('*', expression));
                } else {
                    let prevVal = new MathNode('*', element.getCopy().value);
                    element.value = [prevVal, new MathNode('*', expression.toString())];
                }

            } else if (element.value !== '0') {
                if (expression.value === '1') {
                    if (expression.sign === '-') {
                        element.changeSign();
                    }
                } else {
                    let prevVal = new MathNode('*', element.value);
                    element.value = [prevVal, new MathNode('*', expression.toString())];
                }
            }
        });
        this.correctStructure();
    }

    /**
     * Multiplies the division. Called only from method multiply; separate method for better readability
     * @param mathNode MathNode to multiply
     * @param expression multiplier
     */
    multiplyDivision(mathNode: MathNode, expression: MathNode) {
        if (Array.isArray(mathNode.value[1].value)) {
            //Checks whether it is possible to cancel out expression and MathNode from denominatior

            for (let i = 0; i < mathNode.value[1].value.length; i++) {
                if (MathNode.areExpEqual(mathNode.value[1].value[i], expression)) {
                    mathNode.value[1].value.splice(i, 1);
                    return;
                }
            }
            for (let i = 0; i < mathNode.value[1].value.length; i++) {
                if (MathNode.areAbsExpEqual(mathNode.value[1].value[i], expression)) {
                    mathNode.value[1].value.splice(i, 1);
                    mathNode.changeSign();
                    return;
                }
            }
        }


        if (MathNode.areExpEqual(mathNode.value[1], expression)) {
            //Expression equils donominator and cancel each other out

            mathNode.value = mathNode.value[0].value;
        } else if (MathNode.areAbsExpEqual(mathNode.value[1], expression)) {
            //Expression equils minus donominator and cancel each other out

            mathNode.value = mathNode.value[0].value;
            mathNode.changeSign();
        } else {
            if (Array.isArray(mathNode.value[0].value)) {
                //Numerator is array
                if (mathNode.value[0].value[0].sign === '*') {
                    //Last executed operation in numerator would be multiplication

                    mathNode.value[0].value[0].sign = '*';
                    mathNode.value[0].value.splice(0, 0, expression);

                } else if (mathNode.value[0].value[0].sign === '/') {
                    //Last executed operation in numerator would be division

                    let prevVal = new MathNode('*', mathNode.value[0].value);
                    mathNode.value[0].value = [expression, prevVal];
                } else {
                    //Last executed operation in numerator would be addition or substraction

                    let prevVal = new MathNode('*', mathNode.value[0].value);
                    mathNode.value[0].value = [expression, prevVal];
                }
            } else {
                //No better alternative found – expression multiplies nominator
                let prevVal = new MathNode('*', mathNode.value[0].value);
                mathNode.value[0].value = [expression, prevVal];
            }
        }

    }

    /*removeUnnecessaryBrackets() {
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

    }*/

    /**
     * Devides MathNode by expression. Called only in root MathNode
     * @param expression to devide with
     */
    divide(expression: MathNode) {
        this.value.forEach(element => {
            if (Array.isArray(element.value)) {

                if (element.value[0].sign === '*') {
                    this.divideMultiplication(element, expression.getCopy());
                } else if (element.value[0].sign === '/') {
                    this.divideDivision(element, expression.getCopy());
                } else {
                    element.value = [new MathNode('/', element.value), new MathNode('/', expression.toString())];
                }
            } else if (element.value !== '0') {
                if (MathNode.areExpEqual(element, expression)) {
                    element.sign = '+';
                    element.value = '1';

                } else if (MathNode.areAbsExpEqual(element, expression)) {
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

    /**
     * Devides the multiplication. Called only from method divide; separate method for better readability
     * @param mathNode MathNode to divide
     * @param expression divisor
     */
    divideMultiplication(mathNode: MathNode, expression: MathNode) {
        for (let i = 0; i < mathNode.value.length; i++) {

            if (MathNode.areExpEqual(mathNode.value[i], expression)) {
                mathNode.value.splice(i, 1);
                return;
            }

            if (MathNode.areAbsExpEqual(mathNode.value[i], expression)) {
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

    /**
     * Devides the division. Called only from method divide; separate method for better readability
     * @param mathNode MathNode to divide
     * @param expression divisor
     */
    divideDivision(mathNode: MathNode, expression: MathNode) {
        if (MathNode.areExpEqual(mathNode.value[0], expression)) {
            mathNode.value[0].value = '1';
        } else {
            if (Array.isArray(mathNode.value[0].value)) {
                if (mathNode.value[0].value[0].sign === '*') {
                    for (let i = 0; i < mathNode.value[0].value.length; i++) {
                        if (MathNode.areExpEqual(mathNode.value[0].value[i], expression)) {
                            mathNode.value[0].value.splice(i, 1);
                            return;

                        }
                    }

                }
            }
            if (Array.isArray(mathNode.value[1].value)) {
                if (mathNode.value[1].value[0].sign === '*') {
                    mathNode.value[1].value.push(new MathNode('*', expression.toString()));
                } else if (mathNode.value[1].value[0].sign === '/') {

                } else if (mathNode.value[1].value[0].sign === '+' || mathNode.value[1].value[0].sign === '-') {

                    let prevVal = new MathNode('*', mathNode.value[1].value);
                    mathNode.value[1].value = [prevVal, new MathNode('/', expression.toString())];
                }
            } else {

                let prevVal = new MathNode('*', mathNode.value[1].value);
                mathNode.value[1].value = [prevVal, new MathNode('*', expression.toString())];
            }

        }
    }

    /**
     * Changes plus to minus and other way round.
     */
    changeSign() {
        if (this.sign === '+') {
            this.sign = '-';
        } else if (this.sign === '-') {
            this.sign = '+';
        }
    }

    /**
     * Return true when searchedMathNode is child of this object
     * @param searchedUUID 
     */
    isChildOf(searchedMathNode: MathNode): boolean {
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                if (searchedMathNode.uuid === this.value[i].uuid) {
                    return true;
                };
            }
        }
        return false;
    }

    /**
     * Returns parent of searchedMathNode. If none is found, then returns undefined.
     * @param searchedMathNode 
     */
    findParent(searchedMathNode: MathNode): MathNode {
        let valArray = this.getValueAsArray();
        for (let i = 0; i < valArray.length; i++) {

            if (valArray[i].uuid === searchedMathNode.uuid) {
                return this;
            }
        }
        for (let i = 0; i < valArray.length; i++) {
            if (valArray[i].findParent(searchedMathNode) !== undefined) {
                return valArray[i].findParent(searchedMathNode);
            }
        }
        return undefined;
    }

    /**
     * Checks whether firstMathNode and secondMathNode are childs of same MathNode.
     * @param firstMathNode 
     * @param secondMathNode 
     */
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

    /**
     * Returns value of this.value as Array.
     */
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

    /**
     * Returns copy of this.
     */
    getCopy(): MathNode {
        return new MathNode(this.sign, this.value, this.root);
    }

    /**
     * Changes value of this.selected and calls this method for child MathNodes.
     * @param newValue new value of this.selected
     */
    setSelected(newValue: boolean = false) {
        this.selected = newValue;
        this.getValueAsArray().forEach(element => {
            element.setSelected(newValue);
        });
    }

    /**
     * Finds and returns string of all variables used in MathNode.
     */
    findVariables(): string {
        //add err tooManyVars
        let variable = '';
        if (typeof (this.value) === 'string' && this.value.match(/[a-z]/ig) !== null) {
            variable = this.value.match(/[a-z]/ig).join('');
        } else if (Array.isArray(this.value)) {
            //recursively calls this method

            for (let i = 0; i < this.value.length; i++) {
                variable += this.value[i].findVariables();
            }
        }
        return variable.split('')
            .filter(function (item, pos, self) {
                return self.indexOf(item) == pos;
            })
            .join('');
    }

    /**
     * Checks whether the MathNode is mathematicly valid.
     */
    isValid(): boolean {
        if (typeof (this.value) === 'string' && (this.value === '' || this.value.match(/([^a-zA-Z0-9.])/))) {
            return false;
        }
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                if (!this.value[i].isValid()) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Return string representation of a MathNode.
     * @param first when false string is in brackets
     */
    toString(first: boolean = true) {
        let string = '';
        if (Array.isArray(this.value)) {
            if (!first || this.sign.match(/([+*/])/) === null) {
                string += this.sign;
            }
            if (this.value[0].sign !== '*' && this.value[0].sign !== '/' && !this.root) {
                string += '(';
            }

            for (let i = 0; i < this.value.length; i++) {
                string += this.value[i].toString(i === 0);
            }
            if (this.value[0].sign !== '*' && this.value[0].sign !== '/' && !this.root) {
                string += ')';
            }
        } else {
            if (!first || this.sign.match(/([+*/])/) === null) {
                string += this.sign;
            }
            string += this.value;
        }

        return string;
    }

    /**
     * Returns true if both expressions are equal.
     * @param exp1 first expression
     * @param exp2 second expression
     */
    static areExpEqual(exp1: MathNode, exp2: MathNode): boolean {
        let exp1AsString = exp1.toString();
        let exp2AsString = exp2.toString();
        let e1 = nerdamer(exp1AsString.toString(), undefined, "expand");
        let e2 = nerdamer(exp2AsString.toString(), undefined, "expand");
        let diff: string = `${e1.text()} - (${e2.text()})`;

        return nerdamer(diff).text() === '0';
    }

    /**
     * Returns true when absolute values of first and second expression are equal.
     * @param exp1 first expression
     * @param exp2 second expression
     */
    static areAbsExpEqual(exp1: MathNode, exp2: MathNode): boolean {
        let exp1AsString = exp1.toString();
        let exp2AsString = exp2.toString();
        let e1 = nerdamer(exp1AsString.toString(), undefined, "expand");
        let e2 = nerdamer(exp2AsString.toString(), undefined, "expand");
        let diff: string = `abs(${e1.text()}) - abs(${e2.text()})`;

        return nerdamer(diff).text() === '0';
    }
}
