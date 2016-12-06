(function(){
	window["MDS"] = {};

	var dim=numeric.dim,blk=numeric.getBlock,dot=numeric.dot,trans=numeric.transpose,sub=numeric.sub,mul=numeric.mul,
	div=numeric.div,norm2=numeric.norm2,sum=numeric.sum,neg=numeric.neg,inv=numeric.inv,eig=numeric.eig,sqrt=Math.sqrt,
	ab=Math.abs,sq=numeric.sqrt,abs=numeric.abs,ident=numeric.identity,diag=numeric.diag,det=numeric.det,add=numeric.add,
	createT=numeric.t,square=numeric.norm2SquaredV,svd=numeric.svd;

	function central(n){
		var E=[],t=[];
		for(var i=0;i<n;i++)
			t.push(1);
		E[0]=t;
		E=dot(trans(E),E);
		var I=ident(n);
		E=sub(I,div(E,n));
		return E;
	}

	function maxEigV(r){
		var re=r.S,rv=trans(div(add(r.U,r.V),2));
		var max1={n:0,v:re[0]},max2={n:0,v:re[0]};
		for(var i in re){
			if(re[i]>max1.v){
				max1.n=i;
				max1.v=re[i];
			}
		}
		if(max1.n==0)
			max2={n:1,v:re[1]};
		for(var i in re){
			if(i!=max1.n && re[i]>max2.v){
				max2.n=i;
				max2.v=re[i];
			}
		}
		return {n:[max1.n,max2.n],e:[max1.v,max2.v],v:[rv[max1.n],rv[max2.n]]};
	}

	function mdsByDistance(s){
		var d=dim(s);
		if(d[0]!=d[1] || d[0] <=1){
			alert("Incorrect distance matrix!");
			return false;
		}
		var h=central(d[0]);
		for(var i=0;i<d[0];i++)
			s[i][i]=0;
		var g=div(dot(h,s,h),-2);
		var r=maxEigV(svd(g));
		if(r.e[0]<=0 && r.e[1]<=0){
			alert("Incorrect distance matrix!");
			return false;
		}
		var e=diag(r.e);

		return normalize(dot(trans(r.v),sq(e)));
	}

	function mdsByDataOld(s){
		var d=dim(s);
		var data=normalizeData(s)

		var dist=[];
		for(var i=0;i<d[0];i++){
			var k=[];
			dist.push(k);
		}
		for(var i=0;i<d[0];i++){
			dist[i][i]=0;
			for(var j=i+1;j<d[0];j++){
				var k=square(sub(data[i],data[j]));
				dist[i][j]=k;
				dist[j][i]=k;
			}
		}

		return mdsByDistance(dist);
	}

	function mdsByData(s){
		var t_cords = getCoordinates(s, true);
		return dot(s, t_cords);
	}


	function getCoordinates(s, v_large){
		var td=dim(s), n = td[0], d = td[1];

		var t_svd, t_e, t_v, tt_e = [];
		t_svd = svd(s);//n >= d
		t_v = trans(t_svd.V);
		t_e = t_svd.S;
		t_e = mul(t_e, t_e);
		t_e.forEach(function(tt_d){
			tt_e.push(tt_d);
		});
		if(v_large){
			tt_e.sort(function(a, b){
				return b-a;
			});
		}else{
			for(var i in tt_e){
				if(tt_e[i] < 1e-13){
					tt_e[i] = Infinity;
				}
			}
			tt_e.sort(function(a, b){
				return a-b;
			});
		}
		var t_max1 = t_e.indexOf(tt_e[0]), t_max2 = t_e.indexOf(tt_e[1]);
		if(t_max1 == t_max2){
			t_max2 = t_e.indexOf(tt_e[1], t_max1+1);
		}
		if(t_max1 == -1 || t_max2 == -1){
			//console.log("MDS: Error!");
			return;
		}
		else{
			var t_r = [t_v[t_max1], t_v[t_max2]];
			return trans(t_r);
		}
	}

	function getSquareDistances(s){
		var td = dim(s), n = td[0], d = td[1], t_dist = [];
		for(var i =0; i < n; i++){
			var tt_dist = [];
			t_dist.push(tt_dist);
		}
		for(var i = 0; i < n-1; i ++){
			t_dist[i][i] = 0;
			for(var j = i+1; j < n; j++){
				t_dist[i][j] = t_dist[j][i] = norm2(sub(s[i], s[j]));
			}
		}
		t_dist[n-1][n-1] = 0;
		return t_dist;
	}

	function normalize(s){
		var a = dim(s), b = s[0][0], c = s[0][0];
		for(var i = 0; i < a[0]; i++){
			for(var j = 0; j < a[1]; j++){
				if(s[i][j] > b)
					b = s[i][j];
				if(s[i][j] < c)
					c = s[i][j];
			}
		}
		return div(sub(s, c), (b-c));
	}

	function normalizeData(s){
		var td=dim(s), n = td[0], d = td[1];
		var data=trans(s);

		for(var i=0;i<d;i++){
			var r=data[i];
			var Mean=sum(r)/n;
			r=sub(r,Mean);
			var Norm=norm2(r);
			if(Norm!=0){
				data[i]=div(r,Norm);
			}
			else{
				var t_r=Math.sqrt(1/n);
				for(var j=0;j<n;j++)
					data[i][j] = 0;
			}
		}

		return trans(data);
	}

	function getCoordinatesByEigen(v_data, s, v_d){
		var t_eig, t_e, t_v, tt_e = [], t_sub = [];
		t_eig = eig(s);
		t_v = trans(t_eig.E.x);
		t_e = t_eig.lambda.x;
		for(var i in t_e){
			if(Math.abs(t_e[i]) < 1e-13){
				t_e[i] = 0;
			}else{
				t_sub.push(t_v[i]);
			}
		}
		t_e.forEach(function(tt_d, tt_i){
			tt_e.push(tt_d);
		});
		if(v_d){
			tt_e.sort(function(a, b){
				return b-a;
			});
		}else{
			tt_e.sort(function(a, b){
				return a-b;
			});
		}
		var t_max1 = t_e.indexOf(tt_e[0]), t_max2 = t_e.indexOf(tt_e[1]);
		if(t_max1 == t_max2){
			t_max2 = t_e.indexOf(tt_e[1], t_max1+1);
		}
		if(t_max1 == -1 || t_max2 == -1){
			//console.log("MDS: Error!");
			return;
		}
		else{
			var t_r = [t_v[t_max1], t_v[t_max2]];
			if(v_d){
				if(t_e[t_max2] == 0){
					t_r[1] = subspaceMDS(v_data, t_sub, v_d);
				}
			}else{
				if(t_e[t_max1] == 0 && t_e[t_max2] == 0){
					if(t_sub.length>0){
						t_r = subspaceMDS(v_data, t_sub, v_d);
					}else{
						t_r = trans(getCoordinates(v_data, true));
					}
				}
			}
			return trans(t_r);
		}
	}

	function subspaceMDS(v_data, v_sub, v_expand){
		var t_subdata = [], t_subdata = sub(v_data, dot(dot(v_data, trans(v_sub)), v_sub));
		var t_cords = trans(getCoordinates(t_subdata, true));
		if(v_expand){
			return t_cords[0];
		}else{
			return t_cords;
		}
	}

	function getNormalSpace(v_sub){
		var t_subdim = dim(v_sub), t_space = [], t_sub = [];
		for(var i in v_sub){
			t_space.push(v_sub[i]);
		}
		for(var i = t_subdim[0]; i < t_subdim[1]; i++){
			var t_cov = dot(trans(t_space), t_space), t_eig = eig(t_cov);
			var t_e = t_eig.lambda.x, t_v = trans(t_eig.E.x), t_next;
			for(var j in t_e){
				if(t_e[j] < 1e-13){
					t_next = t_v[j];
					break;
				}
			}
			if(t_next){
				t_sub.push(t_next);
				t_space.push(t_next);
			}
		}
		return t_sub;
	}//Get the normal space of v_sub

	window["MDS"]["getSquareDistances"]=getSquareDistances;
	window["MDS"]["getCoordinatesByEigen"]=getCoordinatesByEigen;
	window["MDS"]["getCoordinates"]=getCoordinates;
	window["MDS"]["normalizeData"]=normalizeData;
	window["MDS"]["byDistance"]=mdsByDistance;
	window["MDS"]["byData"]=mdsByData;
	window["MDS"]["subspaceMDS"]=subspaceMDS;
})();