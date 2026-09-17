// ==========================================
// CARÔ BEAUTY - CATÁLOGO
// Supabase + Carrinho + WhatsApp
// ==========================================

const SUPABASE_URL = "https://ehxqgrhpgizekwbqrdwp.supabase.co";

// Use SOMENTE a chave pública/publishable
const SUPABASE_ANON_KEY = "sb_publishable_sYXKhTNj_j6sSGSZkwNkAg_i1P5UAGO";

const WHATSAPP = "5516993340999";

let supabaseClient;
let produtos = [];
let produtosFiltrados = [];
let carrinho = [];


// ==========================================
// INICIAR SUPABASE
// ==========================================

function iniciarSupabase() {

    if (!window.supabase) {

        const script = document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = () => {

            criarClienteSupabase();

        };

        document.head.appendChild(script);

    } else {

        criarClienteSupabase();

    }
}


function criarClienteSupabase() {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    carregarProdutos();

}


// ==========================================
// CARREGAR PRODUTOS DO SUPABASE
// ==========================================

async function carregarProdutos() {

    const grade =
        document.getElementById("gradeProdutos");

    const semProdutos =
        document.getElementById("semProdutos");

    try {

        const { data, error } =
            await supabaseClient
                .from("produtos")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Erro ao carregar produtos:",
                error
            );

            if (grade) {
                grade.innerHTML = "";
            }

            if (semProdutos) {
                semProdutos.style.display = "block";
                semProdutos.innerHTML =
                    "<p>Não foi possível carregar os produtos.</p>";
            }

            return;
        }

        produtos = (data || []).map(produto => ({

            id: produto.id,

            nome: produto.nome || "",

            descricao: produto.descricao || "",

            preco: Number(produto.preco || 0),

            categoria: produto.categoria || "Outros",

            imagem: produto.imagem_url || "",

            estoque: produto.estoque === true

        }));

        produtosFiltrados = [...produtos];

        renderizarProdutos();

    } catch (erro) {

        console.error(
            "Erro ao conectar ao Supabase:",
            erro
        );

        if (semProdutos) {

            semProdutos.style.display = "block";

        }
    }
}


// ==========================================
// RENDERIZAR PRODUTOS
// ==========================================

function renderizarProdutos() {

    const grade =
        document.getElementById("gradeProdutos");

    const semProdutos =
        document.getElementById("semProdutos");

    if (!grade) return;

    grade.innerHTML = "";

    if (produtosFiltrados.length === 0) {

        if (semProdutos) {
            semProdutos.style.display = "block";
        }

        return;

    }

    if (semProdutos) {
        semProdutos.style.display = "none";
    }


    produtosFiltrados.forEach(produto => {

        const card =
            document.createElement("article");

        card.className = "produto-card";


        const preco =
            Number(produto.preco || 0)
                .toFixed(2)
                .replace(".", ",");


        const imagemHTML =
            produto.imagem

                ? `
                    <img
                        src="${produto.imagem}"
                        alt="${produto.nome}"
                        class="imagem-produto"
                    >
                `

                : `
                    <div class="produto-sem-imagem">
                        CARÔ BEAUTY
                    </div>
                `;


        const estoqueHTML =
            produto.estoque

                ? `
                    <button
                        class="botao-adicionar"
                        onclick="adicionarAoCarrinho(${produto.id})"
                    >
                        ADICIONAR
                    </button>
                `

                : `
                    <button
                        class="botao-adicionar"
                        disabled
                    >
                        SEM ESTOQUE
                    </button>
                `;


        card.innerHTML = `

            <div class="imagem-card">

                ${imagemHTML}

            </div>


            <div class="conteudo-card">

                <span class="categoria-produto">
                    ${produto.categoria}
                </span>

                <h3>
                    ${produto.nome}
                </h3>

                <p>
                    ${produto.descricao}
                </p>

                <strong class="preco-produto">
                    R$ ${preco}
                </strong>

                ${
                    !produto.estoque
                        ? `
                            <span class="produto-esgotado">
                                Sem estoque
                            </span>
                        `
                        : ""
                }

                ${estoqueHTML}

            </div>

        `;


        grade.appendChild(card);

    });

}


// ==========================================
// PESQUISA
// ==========================================

function pesquisarProdutos() {

    const campo =
        document.getElementById("campoBusca");

    if (!campo) return;

    const busca =
        campo.value
            .toLowerCase()
            .trim();


    produtosFiltrados =
        produtos.filter(produto =>

            produto.nome
                .toLowerCase()
                .includes(busca)

            ||

            produto.descricao
                .toLowerCase()
                .includes(busca)

            ||

            produto.categoria
                .toLowerCase()
                .includes(busca)

        );


    renderizarProdutos();

}


// ==========================================
// CATEGORIAS
// ==========================================

function filtrarCategoria(categoria) {

    if (categoria === "Todos") {

        produtosFiltrados =
            [...produtos];

    } else {

        produtosFiltrados =
            produtos.filter(
                produto =>
                    produto.categoria === categoria
            );

    }


    renderizarProdutos();


    document
        .querySelectorAll(".categoria-btn")
        .forEach(botao => {

            botao.classList.remove("ativo");

        });


    const botoes =
        document.querySelectorAll(".categoria-btn");


    botoes.forEach(botao => {

        if (
            botao.textContent
                .trim()
                .toLowerCase() ===
            categoria.toLowerCase()
        ) {

            botao.classList.add("ativo");

        }

    });

}


// ==========================================
// CARRINHO
// ==========================================

function adicionarAoCarrinho(id) {

    const produto =
        produtos.find(
            item => item.id === id
        );


    if (!produto || !produto.estoque) {
        return;
    }


    const item =
        carrinho.find(
            item => item.id === id
        );


    if (item) {

        item.quantidade++;

    } else {

        carrinho.push({

            id: produto.id,

            nome: produto.nome,

            preco: Number(produto.preco),

            quantidade: 1

        });

    }


    atualizarCarrinho();

    abrirCarrinho();

}


// ==========================================
// ALTERAR QUANTIDADE
// ==========================================

function aumentarQuantidade(id) {

    const item =
        carrinho.find(
            produto => produto.id === id
        );

    if (!item) return;

    item.quantidade++;

    atualizarCarrinho();

}


function diminuirQuantidade(id) {

    const item =
        carrinho.find(
            produto => produto.id === id
        );

    if (!item) return;


    item.quantidade--;


    if (item.quantidade <= 0) {

        carrinho =
            carrinho.filter(
                produto => produto.id !== id
            );

    }


    atualizarCarrinho();

}


// ==========================================
// REMOVER
// ==========================================

function removerDoCarrinho(id) {

    carrinho =
        carrinho.filter(
            produto => produto.id !== id
        );

    atualizarCarrinho();

}


// ==========================================
// ATUALIZAR CARRINHO
// ==========================================

function atualizarCarrinho() {

    const lista =
        document.getElementById("listaCarrinho");

    const contador =
        document.getElementById("contadorCarrinho");

    const totalElement =
        document.getElementById("totalCarrinho");


    if (!lista) return;


    lista.innerHTML = "";


    let total = 0;
    let quantidadeTotal = 0;


    carrinho.forEach(item => {

        const subtotal =
            item.preco * item.quantidade;


        total += subtotal;

        quantidadeTotal +=
            item.quantidade;


        const div =
            document.createElement("div");

        div.className =
            "item-carrinho";


        div.innerHTML = `

            <div class="item-carrinho-info">

                <strong>
                    ${item.nome}
                </strong>

                <span>
                    R$ ${item.preco
                        .toFixed(2)
                        .replace(".", ",")}
                </span>

            </div>


            <div class="controles-carrinho">

                <button
                    onclick="diminuirQuantidade(${item.id})"
                >
                    −
                </button>

                <span>
                    ${item.quantidade}
                </span>

                <button
                    onclick="aumentarQuantidade(${item.id})"
                >
                    +
                </button>

                <button
                    class="remover-item"
                    onclick="removerDoCarrinho(${item.id})"
                >
                    ×
                </button>

            </div>

        `;


        lista.appendChild(div);

    });


    if (contador) {

        contador.textContent =
            quantidadeTotal;

    }


    if (totalElement) {

        totalElement.textContent =
            "R$ " +
            total
                .toFixed(2)
                .replace(".", ",");

    }

}


// ==========================================
// ABRIR CARRINHO
// ==========================================

function abrirCarrinho() {

    const carrinhoElement =
        document.getElementById("carrinho");

    if (carrinhoElement) {

        carrinhoElement.classList.add("aberto");

    }

}


function fecharCarrinho() {

    const carrinhoElement =
        document.getElementById("carrinho");

    if (carrinhoElement) {

        carrinhoElement.classList.remove("aberto");

    }

}


// ==========================================
// ENVIAR PEDIDO PELO WHATSAPP
// ==========================================

function enviarPedidoWhatsApp() {

    if (carrinho.length === 0) {

        alert("Seu carrinho está vazio.");

        return;

    }


    const nomeInput =
        document.getElementById("nomeCliente");

    const observacaoInput =
        document.getElementById("observacaoPedido");


    const nome =
        nomeInput
            ? nomeInput.value.trim()
            : "";


    const observacao =
        observacaoInput
            ? observacaoInput.value.trim()
            : "";


    let mensagem =
        "Olá! Gostaria de fazer um pedido na CARÔ BEAUTY.%0A%0A";


    if (nome) {

        mensagem +=
            "*Nome:* " +
            encodeURIComponent(nome) +
            "%0A%0A";

    }


    mensagem +=
        "*Pedido:*%0A";


    let total = 0;


    carrinho.forEach(item => {

        const subtotal =
            item.preco * item.quantidade;


        total += subtotal;


        mensagem +=
            encodeURIComponent(
                `${item.quantidade}x ${item.nome} - R$ ${subtotal
                    .toFixed(2)
                    .replace(".", ",")}`
            ) +
            "%0A";

    });


    mensagem +=
        "%0A*Total: R$ " +
        total
            .toFixed(2)
            .replace(".", ",") +
        "*";


    if (observacao) {

        mensagem +=
            "%0A%0A*Observação:*%0A" +
            encodeURIComponent(observacao);

    }


    const url =
        `https://wa.me/${WHATSAPP}?text=${mensagem}`;


    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        iniciarSupabase();


        const campoBusca =
            document.getElementById("campoBusca");


        if (campoBusca) {

            campoBusca.addEventListener(
                "input",
                pesquisarProdutos
            );

        }


        const botoesCategoria =
            document.querySelectorAll(
                ".categoria-btn"
            );


        botoesCategoria.forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    filtrarCategoria(
                        botao.textContent.trim()
                    );

                }
            );

        });


        atualizarCarrinho();

    }
);
