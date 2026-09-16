/* =========================================
   CARÔ BEAUTY
   ÁREA ADMINISTRATIVA
========================================= */


/* =========================================
   CONFIGURAÇÃO
========================================= */


/*
   SENHA DA ÁREA ADMINISTRATIVA

   Você pode trocar "caro123"
   pela senha que quiser.
*/

const SENHA_ADMIN = "caro123";


/*
   NOME DO LOCALSTORAGE
*/

const CHAVE_PRODUTOS = "caroBeautyProdutos";


/* =========================================
   VARIÁVEIS
========================================= */

let produtos = [];

let produtoEditando = null;


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        produtos = carregarProdutos();

        mostrarProdutos();

    }
);


/* =========================================
   CARREGAR PRODUTOS
========================================= */

function carregarProdutos() {

    const produtosSalvos =
        localStorage.getItem(CHAVE_PRODUTOS);


    if (produtosSalvos) {

        return JSON.parse(produtosSalvos);

    }


    /*
       Produtos iniciais
    */

    const produtosIniciais = [

        {
            id: 1,
            nome: "Gloss Labial",
            descricao:
                "Brilho intenso e acabamento delicado.",
            preco: 29.90,
            categoria: "Maquiagem",
            estoque: true,
            imagem: ""
        },

        {
            id: 2,
            nome: "Máscara de Cílios",
            descricao:
                "Volume e definição para os cílios.",
            preco: 35.90,
            categoria: "Maquiagem",
            estoque: true,
            imagem: ""
        },

        {
            id: 3,
            nome: "Hidratante Facial",
            descricao:
                "Hidratação para uma pele macia.",
            preco: 42.90,
            categoria: "Skincare",
            estoque: true,
            imagem: ""
        },

        {
            id: 4,
            nome: "Leave-in Capilar",
            descricao:
                "Finalização e cuidado para os cabelos.",
            preco: 38.90,
            categoria: "Cabelos",
            estoque: true,
            imagem: ""
        }

    ];


    localStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(produtosIniciais)
    );


    return produtosIniciais;
}


/* =========================================
   SALVAR PRODUTOS
========================================= */

function salvarProdutos() {

    localStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(produtos)
    );

}


/* =========================================
   LOGIN
========================================= */

function entrarAdmin() {

    const senha =
        document.getElementById(
            "senhaAdmin"
        ).value;


    const erro =
        document.getElementById(
            "erroLogin"
        );


    if (senha === SENHA_ADMIN) {

        document.getElementById(
            "telaLogin"
        ).style.display = "none";


        document.getElementById(
            "painelAdmin"
        ).style.display = "block";


        erro.textContent = "";

    } else {

        erro.textContent =
            "Senha incorreta.";

    }

}


/* =========================================
   ENTER NO LOGIN
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            document.getElementById("telaLogin")
                .style.display !== "none"
        ) {

            entrarAdmin();

        }

    }
);


/* =========================================
   SAIR
========================================= */

function sairAdmin() {

    document.getElementById(
        "painelAdmin"
    ).style.display = "none";


    document.getElementById(
        "telaLogin"
    ).style.display = "flex";


    document.getElementById(
        "senhaAdmin"
    ).value = "";

}


/* =========================================
   ABRIR FORMULÁRIO
========================================= */

function abrirFormulario() {

    produtoEditando = null;


    document.getElementById(
        "formularioProduto"
    ).style.display = "block";


    document.getElementById(
        "tituloFormulario"
    ).textContent =
        "Novo produto";


    document.getElementById(
        "formProduto"
    ).reset();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   FECHAR FORMULÁRIO
========================================= */

function fecharFormulario() {

    document.getElementById(
        "formularioProduto"
    ).style.display = "none";


    produtoEditando = null;

}


/* =========================================
   SALVAR PRODUTO
========================================= */

async function salvarProduto(event) {

    event.preventDefault();


    const nome =
        document.getElementById(
            "nomeProduto"
        ).value.trim();


    const descricao =
        document.getElementById(
            "descricaoProduto"
        ).value.trim();


    const preco =
        Number(
            document.getElementById(
                "precoProduto"
            ).value
        );


    const categoria =
        document.getElementById(
            "categoriaProduto"
        ).value;


    const estoque =
        document.getElementById(
            "estoqueProduto"
        ).value === "true";


    const arquivo =
        document.getElementById(
            "imagemProduto"
        ).files[0];


    let imagem = "";


    /*
       Se estiver editando e não escolher
       outra foto, mantém a antiga.
    */

    if (produtoEditando) {

        const produtoAtual =
            produtos.find(
                produto =>
                    produto.id === produtoEditando
            );


        if (produtoAtual) {

            imagem =
                produtoAtual.imagem || "";

        }

    }


    /*
       Se escolheu uma nova imagem,
       transforma em base64.
    */

    if (arquivo) {

        imagem =
            await transformarImagem(arquivo);

    }


    const novoProduto = {

        id:
            produtoEditando ||
            Date.now(),

        nome: nome,

        descricao: descricao,

        preco: preco,

        categoria: categoria,

        estoque: estoque,

        imagem: imagem

    };


    /*
       EDITAR
    */

    if (produtoEditando) {

        produtos =
            produtos.map(
                produto =>
                    produto.id === produtoEditando
                        ? novoProduto
                        : produto
            );

    }


    /*
       NOVO
    */

    else {

        produtos.push(novoProduto);

    }


    salvarProdutos();

    mostrarProdutos();

    fecharFormulario();

}


/* =========================================
   TRANSFORMAR IMAGEM
========================================= */

function transformarImagem(arquivo) {

    return new Promise(
        (resolve, reject) => {

            const leitor =
                new FileReader();


            leitor.onload = function () {

                resolve(
                    leitor.result
                );

            };


            leitor.onerror = reject;


            leitor.readAsDataURL(arquivo);

        }
    );

}


/* =========================================
   MOSTRAR PRODUTOS
========================================= */

function mostrarProdutos() {

    const lista =
        document.getElementById(
            "listaProdutosAdmin"
        );


    lista.innerHTML = "";


    if (produtos.length === 0) {

        lista.innerHTML = `

            <div class="nenhum-produto">

                <span>🛍️</span>

                <p>
                    Nenhum produto cadastrado.
                </p>

            </div>

        `;

        return;

    }


    produtos.forEach(
        produto => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card-admin";


            const imagem =
                produto.imagem

                    ? `<img src="${produto.imagem}" alt="${produto.nome}">`

                    : `<div class="sem-imagem-admin">
                            FOTO
                       </div>`;


            const statusClasse =
                produto.estoque
                    ? "estoque-ok"
                    : "estoque-esgotado";


            const statusTexto =
                produto.estoque
                    ? "EM ESTOQUE"
                    : "SEM ESTOQUE";


            card.innerHTML = `

                <div class="foto-card-admin">

                    ${imagem}

                </div>


                <div class="dados-card-admin">

                    <span class="categoria-admin">
                        ${produto.categoria}
                    </span>


                    <h3>
                        ${produto.nome}
                    </h3>


                    <p>
                        ${produto.descricao || "Sem descrição"}
                    </p>


                    <strong>
                        R$ ${formatarPreco(produto.preco)}
                    </strong>


                    <div class="status-admin ${statusClasse}">
                        ${statusTexto}
                    </div>


                    <div class="acoes-admin">

                        <button
                            onclick="editarProduto(${produto.id})"
                            class="botao-editar"
                        >
                            EDITAR
                        </button>


                        <button
                            onclick="alternarEstoque(${produto.id})"
                            class="botao-estoque"
                        >
                            ${produto.estoque
                                ? "SEM ESTOQUE"
                                : "ATIVAR ESTOQUE"}
                        </button>


                        <button
                            onclick="excluirProduto(${produto.id})"
                            class="botao-excluir"
                        >
                            EXCLUIR
                        </button>

                    </div>

                </div>

            `;


            lista.appendChild(card);

        }
    );

}


/* =========================================
   EDITAR
========================================= */

function editarProduto(id) {

    const produto =
        produtos.find(
            item => item.id === id
        );


    if (!produto) return;


    produtoEditando = id;


    document.getElementById(
        "formularioProduto"
    ).style.display = "block";


    document.getElementById(
        "tituloFormulario"
    ).textContent =
        "Editar produto";


    document.getElementById(
        "nomeProduto"
    ).value =
        produto.nome;


    document.getElementById(
        "descricaoProduto"
    ).value =
        produto.descricao;


    document.getElementById(
        "precoProduto"
    ).value =
        produto.preco;


    document.getElementById(
        "categoriaProduto"
    ).value =
        produto.categoria;


    document.getElementById(
        "estoqueProduto"
    ).value =
        produto.estoque
            ? "true"
            : "false";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   ESTOQUE
========================================= */

function alternarEstoque(id) {

    produtos =
        produtos.map(
            produto => {

                if (produto.id === id) {

                    return {

                        ...produto,

                        estoque:
                            !produto.estoque

                    };

                }


                return produto;

            }
        );


    salvarProdutos();

    mostrarProdutos();

}


/* =========================================
   EXCLUIR
========================================= */

function excluirProduto(id) {

    const produto =
        produtos.find(
            item => item.id === id
        );


    if (!produto) return;


    const confirmar =
        confirm(
            `Deseja realmente excluir "${produto.nome}"?`
        );


    if (!confirmar) return;


    produtos =
        produtos.filter(
            item => item.id !== id
        );


    salvarProdutos();

    mostrarProdutos();

}


/* =========================================
   FORMATAR PREÇO
========================================= */

function formatarPreco(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}